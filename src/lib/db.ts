import { createClient } from "@libsql/client";

const db = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

let initialized = false;

async function ensureTable() {
  if (initialized) return;
  await db.execute(`
    CREATE TABLE IF NOT EXISTS votes (
      constituency TEXT NOT NULL,
      candidate_id TEXT NOT NULL,
      voter_id TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      PRIMARY KEY (constituency, voter_id)
    )
  `);
  await db.execute(
    `CREATE INDEX IF NOT EXISTS idx_votes_constituency ON votes(constituency)`
  );
  await db.execute(`
    CREATE TABLE IF NOT EXISTS comments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      message TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now'))
    )
  `);
  initialized = true;
}

export async function castVote(constituency: string, candidateId: string, voterId: string) {
  await ensureTable();
  await db.execute({
    sql: `INSERT INTO votes (constituency, candidate_id, voter_id)
          VALUES (?, ?, ?)
          ON CONFLICT(constituency, voter_id)
          DO UPDATE SET candidate_id = excluded.candidate_id, updated_at = datetime('now')`,
    args: [constituency, candidateId, voterId],
  });
}

export async function removeVote(constituency: string, voterId: string) {
  await ensureTable();
  await db.execute({
    sql: `DELETE FROM votes WHERE constituency = ? AND voter_id = ?`,
    args: [constituency, voterId],
  });
}

export async function getVotes(constituency: string): Promise<Record<string, number>> {
  await ensureTable();
  const result = await db.execute({
    sql: `SELECT candidate_id, COUNT(*) as count FROM votes WHERE constituency = ? GROUP BY candidate_id`,
    args: [constituency],
  });
  const votes: Record<string, number> = {};
  for (const row of result.rows) {
    votes[row.candidate_id as string] = row.count as number;
  }
  return votes;
}

export async function getUserVote(constituency: string, voterId: string): Promise<string | null> {
  await ensureTable();
  const result = await db.execute({
    sql: `SELECT candidate_id FROM votes WHERE constituency = ? AND voter_id = ?`,
    args: [constituency, voterId],
  });
  return result.rows.length > 0 ? (result.rows[0].candidate_id as string) : null;
}

export interface Comment {
  id: number;
  name: string;
  message: string;
  created_at: string;
}

export async function addComment(name: string, message: string): Promise<Comment> {
  await ensureTable();
  const result = await db.execute({
    sql: `INSERT INTO comments (name, message) VALUES (?, ?) RETURNING id, name, message, created_at`,
    args: [name, message],
  });
  const row = result.rows[0];
  return { id: row.id as number, name: row.name as string, message: row.message as string, created_at: row.created_at as string };
}

export async function getComments(limit = 20, offset = 0): Promise<Comment[]> {
  await ensureTable();
  const result = await db.execute({
    sql: `SELECT id, name, message, created_at FROM comments ORDER BY created_at DESC LIMIT ? OFFSET ?`,
    args: [limit, offset],
  });
  return result.rows.map(row => ({
    id: row.id as number,
    name: row.name as string,
    message: row.message as string,
    created_at: row.created_at as string,
  }));
}
