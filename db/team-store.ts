import { get, put } from '@vercel/blob';
import { seed, stateSchema, type TeamState } from '@/lib/team';

export class RevisionConflict extends Error {}
export type StoredTeam = { data: TeamState; revision: string };
const pathname = 'arena/team-owner.json';

async function readBlob(): Promise<StoredTeam | null> {
  const result = await get(pathname, { access: 'private', useCache: false });
  if (!result) return null;
  if (result.statusCode !== 200 || !result.stream) throw new Error('Unexpected storage response');
  const raw = await new Response(result.stream).json();
  return { data: stateSchema.parse(raw), revision: result.blob.etag };
}

function useLocal() {
  if (process.env.ARENA_STORAGE !== 'local') return false;
  if (process.env.VERCEL || process.env.NODE_ENV === 'production') throw new Error('Local storage is restricted to local development.');
  return true;
}

export async function readTeam(): Promise<StoredTeam> {
  if (useLocal()) return (await import('./local-store')).readLocalTeam();
  const existing = await readBlob();
  if (existing) return existing;
  const initial = seed();
  try {
    const result = await put(pathname, JSON.stringify(initial), { access: 'private', addRandomSuffix: false, allowOverwrite: false, contentType: 'application/json' });
    return { data: initial, revision: result.etag };
  } catch (error) {

    const created = await readBlob();
    if (!created) throw error;
    return created;
  }
}

export async function writeTeam(data: TeamState, revision: string): Promise<string> {
  if (useLocal()) return (await import('./local-store')).writeLocalTeam(data, revision);
  try {
    const result = await put(pathname, JSON.stringify(data), { access: 'private', addRandomSuffix: false, allowOverwrite: true, ifMatch: revision, contentType: 'application/json' });
    return result.etag;
  } catch (error) {
    if (error instanceof Error && /precondition|etag|match/i.test(error.message)) throw new RevisionConflict();
    throw error;
  }
}

