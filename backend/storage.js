import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// This automatically creates a local file called 'homing_pigeon.db' in your backend folder
const db = new Database(path.join(__dirname, 'homing_pigeon.db'));

// Create the tables automatically if they don't exist yet
db.exec(`
  CREATE TABLE IF NOT EXISTS pastes (
    id TEXT PRIMARY KEY,
    title TEXT DEFAULT 'Untitled Paste',
    category TEXT DEFAULT 'General',
    content TEXT NOT NULL,
    syntax TEXT DEFAULT 'plaintext',
    isBurn INTEGER DEFAULT 0,
    createdAt INTEGER,
    expiresAt INTEGER
  )
`);

// We export an interface that matches how you used pasteStorage in your server!
const pasteStorage = {
    // 1. Check if a paste exists or read it
    get(id) {
        const stmt = db.prepare('SELECT * FROM pastes WHERE id = ?');
        const row = stmt.get(id);
        if (!row) return undefined;
        
        // Convert SQLite's 1/0 integer back to a JS boolean
        return {
            ...row,
            isBurn: Boolean(row.isBurn)
        };
    },

    // 2. Insert or update a paste
    set(id, pasteData) {
        const stmt = db.prepare(`
            INSERT OR REPLACE INTO pastes (id, title, category, content, syntax, isBurn, createdAt, expiresAt)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `);
        stmt.run(
            id,
            pasteData.title,
            pasteData.category,
            pasteData.content,
            pasteData.syntax,
            pasteData.isBurn ? 1 : 0, // SQLite stores booleans as 1s or 0s
            pasteData.createdAt,
            pasteData.expiresAt
        );
    },

    // 3. Delete a paste (for expiration and burn-after-read)
    delete(id) {
        const stmt = db.prepare('DELETE FROM pastes WHERE id = ?');
        stmt.run(id);
    },

    // 4. Expose all pastes so your background garbage collector can scan them
    getAll() {
        const stmt = db.prepare('SELECT * FROM pastes');
        return stmt.all().map(row => ({
            ...row,
            isBurn: Boolean(row.isBurn)
        }));
    }
};

export default pasteStorage;