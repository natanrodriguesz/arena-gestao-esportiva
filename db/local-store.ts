import { DatabaseSync } from 'node:sqlite';
import { mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { seed, stateSchema, type TeamState } from '@/lib/team';
import { RevisionConflict, type StoredTeam } from './team-store';
function connect() {
  const directory = resolve(process.cwd(), '.arena');
  mkdirSync(directory, { recursive: true });
  const db = new DatabaseSync(resolve(directory, 'development.sqlite'));
  db.exec('PRAGMA busy_timeout = 5000');
  db.exec('CREATE TABLE IF NOT EXISTS team (id INTEGER PRIMARY KEY, data TEXT NOT NULL, revision INTEGER NOT NULL DEFAULT 0)');
  return db;
}
export function readLocalTeam(): StoredTeam {
  const db = connect();
  try {
    db.prepare('INSERT OR IGNORE INTO team (id, data, revision) VALUES (1, ?, 0)').run(JSON.stringify(seed()));
    const row = db.prepare('SELECT data, revision FROM team WHERE id = 1').get() as { data: string; revision: number };
    return { data: stateSchema.parse(JSON.parse(row.data)), revision: String(row.revision) };
  } finally { db.close(); }
}
export function writeLocalTeam(data: TeamState, revision: string): string {
  if (!/^\d+$/.test(revision)) throw new RevisionConflict();
  const db = connect();
  try {
    const result = db.prepare('UPDATE team SET data = ?, revision = revision + 1 WHERE id = 1 AND revision = ?').run(JSON.stringify(data), Number(revision));
    if (!result.changes) throw new RevisionConflict();
    return String(Number(revision) + 1);
  } finally { db.close(); }
}
