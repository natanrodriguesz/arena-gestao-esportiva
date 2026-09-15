import { readTeam, writeTeam, RevisionConflict } from '@/db/team-store';
import { stateSchema, courtSlots } from '@/lib/team';
import { getArenaUser } from '@/lib/auth';
import { sameOrigin } from '@/lib/session';
import { z } from 'zod';
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
const reply = (data: unknown, status = 200) => Response.json(data, { status, headers: { 'Cache-Control': 'private, no-store' } });
export async function GET() {
  if (!(await getArenaUser())) return reply({ error: 'Entre para acessar seu time.' }, 401);
  try { return reply(await readTeam()); }
  catch (error) { console.error('Load team failed', error instanceof Error ? error.name : 'StorageError'); return reply({ error: 'Não foi possível carregar o time. Tente novamente.' }, 503); }
}
export async function PUT(request: Request) {
  if (!(await getArenaUser())) return reply({ error: 'Entre para salvar as alterações.' }, 401);
  if (!sameOrigin(request)) return reply({ error: 'Origem inválida.' }, 403);
  if (Number(request.headers.get('content-length') || 0) > 2000000) return reply({ error: 'Limite de dados excedido.' }, 413);
  try {
    const body = await request.text();
    if (body.length > 2000000) return reply({ error: 'Limite de dados excedido.' }, 413);
    const parsed = z.object({ data: stateSchema, revision: z.string().min(1).max(200) }).safeParse(JSON.parse(body));
    if (!parsed.success) return reply({ error: 'Verifique os campos preenchidos.' }, 400);
    const { data, revision } = parsed.data;
    const ids = new Set(data.players.map(player => player.id));
    const validIds = (references: string[]) => references.every(id => ids.has(id));
    if (ids.size !== data.players.length || [...data.evaluations, ...data.payments, ...data.contracts].some(record => !ids.has(record.playerId)) || [...data.trainings, ...data.meals].some(record => !validIds(record.athletes)) || data.trainings.some(record => !validIds(record.completed)) || data.events.some(record => !validIds(record.confirmed))) return reply({ error: 'Um dos atletas selecionados não pertence ao elenco.' }, 400);
    for (const [key, positions] of Object.entries(data.lineups)) {
      const split = key.lastIndexOf(':');
      const eventId = key.slice(0, split), sport = key.slice(split + 1);
      const selected = positions.filter(Boolean);
      if (!data.events.some(event => event.id === eventId) || !courtSlots[sport] || positions.length !== courtSlots[sport].length || !validIds(selected) || new Set(selected).size !== selected.length) return reply({ error: 'Verifique os atletas e as posições da escalação.' }, 400);
    }
    return reply({ revision: await writeTeam(data, revision) });
  } catch (error) {
    if (error instanceof RevisionConflict) return reply({ error: 'O time foi atualizado em outra aba. Recarregue os dados antes de salvar.' }, 409);
    if (error instanceof SyntaxError) return reply({ error: 'Dados inválidos.' }, 400);
    console.error('Save team failed', error instanceof Error ? error.name : 'StorageError');
    return reply({ error: 'Não foi possível salvar. Seu formulário foi preservado; tente novamente.' }, 503);
  }
}
