import Database from 'better-sqlite3';
import * as path from 'path';
import * as fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { Chat, Message } from '../../shared/types';

export class Database {
  private db: Database.Database | null = null;
  private dbPath: string;

  constructor(dbPath: string) {
    this.dbPath = dbPath;
  }

  async initialize(): Promise<void> {
    // Ensure directory exists
    const dir = path.dirname(this.dbPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    this.db = new Database(this.dbPath);
    this.db.pragma('journal_mode = WAL');

    // Create tables
    this.createTables();
  }

  private createTables(): void {
    if (!this.db) throw new Error('Database not initialized');

    // Chats table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS chats (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL DEFAULT 'New conversation',
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL,
        model_id TEXT,
        provider_id TEXT,
        project_folder TEXT,
        is_archived INTEGER DEFAULT 0
      )
    `);

    // Messages table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS messages (
        id TEXT PRIMARY KEY,
        chat_id TEXT NOT NULL,
        role TEXT NOT NULL CHECK(role IN ('user','assistant','system','tool')),
        content TEXT NOT NULL,
        tool_calls TEXT,
        tool_results TEXT,
        thinking_content TEXT,
        attached_files TEXT,
        model_id TEXT,
        provider_id TEXT,
        tokens_used INTEGER,
        created_at INTEGER NOT NULL,
        FOREIGN KEY (chat_id) REFERENCES chats(id) ON DELETE CASCADE
      )
    `);

    // Full-text search for messages
    this.db.exec(`
      CREATE VIRTUAL TABLE IF NOT EXISTS messages_fts USING fts5(
        content, chat_id UNINDEXED,
        content='messages', content_rowid='rowid'
      )
    `);

    // Settings table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
      )
    `);

    // Skills table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS skills (
        id TEXT PRIMARY KEY,
        filename TEXT NOT NULL,
        name TEXT NOT NULL,
        description TEXT,
        content TEXT NOT NULL,
        created_at INTEGER NOT NULL
      )
    `);

    // Create indexes
    this.db.exec(`
      CREATE INDEX IF NOT EXISTS idx_messages_chat_id ON messages(chat_id);
      CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);
      CREATE INDEX IF NOT EXISTS idx_chats_updated_at ON chats(updated_at);
    `);
  }

  // Chat operations
  getChats(): Chat[] {
    if (!this.db) throw new Error('Database not initialized');

    const stmt = this.db.prepare(`
      SELECT * FROM chats
      WHERE is_archived = 0
      ORDER BY updated_at DESC
    `);

    return stmt.all() as Chat[];
  }

  createChat(chat: Partial<Chat>): Chat {
    if (!this.db) throw new Error('Database not initialized');

    const now = Date.now();
    const id = chat.id || uuidv4();

    const stmt = this.db.prepare(`
      INSERT INTO chats (id, title, created_at, updated_at, model_id, provider_id, project_folder, is_archived)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      id,
      chat.title || 'New conversation',
      chat.created_at || now,
      chat.updated_at || now,
      chat.model_id || null,
      chat.provider_id || null,
      chat.project_folder || null,
      chat.is_archived || 0
    );

    return this.getChatById(id)!;
  }

  getChatById(id: string): Chat | null {
    if (!this.db) throw new Error('Database not initialized');

    const stmt = this.db.prepare('SELECT * FROM chats WHERE id = ?');
    return stmt.get(id) as Chat | null;
  }

  updateChat(id: string, updates: Partial<Chat>): Chat | null {
    if (!this.db) throw new Error('Database not initialized');

    const fields: string[] = [];
    const values: any[] = [];

    if (updates.title !== undefined) {
      fields.push('title = ?');
      values.push(updates.title);
    }
    if (updates.model_id !== undefined) {
      fields.push('model_id = ?');
      values.push(updates.model_id);
    }
    if (updates.provider_id !== undefined) {
      fields.push('provider_id = ?');
      values.push(updates.provider_id);
    }
    if (updates.project_folder !== undefined) {
      fields.push('project_folder = ?');
      values.push(updates.project_folder);
    }
    if (updates.is_archived !== undefined) {
      fields.push('is_archived = ?');
      values.push(updates.is_archived);
    }

    fields.push('updated_at = ?');
    values.push(Date.now());
    values.push(id);

    const stmt = this.db.prepare(`
      UPDATE chats SET ${fields.join(', ')} WHERE id = ?
    `);

    stmt.run(...values);

    return this.getChatById(id);
  }

  deleteChat(id: string): boolean {
    if (!this.db) throw new Error('Database not initialized');

    const stmt = this.db.prepare('DELETE FROM chats WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  }

  // Message operations
  getMessages(chatId: string): Message[] {
    if (!this.db) throw new Error('Database not initialized');

    const stmt = this.db.prepare(`
      SELECT * FROM messages
      WHERE chat_id = ?
      ORDER BY created_at ASC
    `);

    const rows = stmt.all(chatId) as any[];

    return rows.map(row => ({
      ...row,
      tool_calls: row.tool_calls ? JSON.parse(row.tool_calls) : undefined,
      tool_results: row.tool_results ? JSON.parse(row.tool_results) : undefined,
      attached_files: row.attached_files ? JSON.parse(row.attached_files) : undefined,
    }));
  }

  saveMessage(message: Partial<Message>): Message {
    if (!this.db) throw new Error('Database not initialized');

    const now = Date.now();
    const id = message.id || uuidv4();

    const stmt = this.db.prepare(`
      INSERT INTO messages (
        id, chat_id, role, content, tool_calls, tool_results,
        thinking_content, attached_files, model_id, provider_id,
        tokens_used, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      id,
      message.chat_id,
      message.role,
      message.content,
      message.tool_calls ? JSON.stringify(message.tool_calls) : null,
      message.tool_results ? JSON.stringify(message.tool_results) : null,
      message.thinking_content || null,
      message.attached_files ? JSON.stringify(message.attached_files) : null,
      message.model_id || null,
      message.provider_id || null,
      message.tokens_used || null,
      message.created_at || now
    );

    // Update chat's updated_at
    this.updateChat(message.chat_id!, { updated_at: now });

    return this.getMessageById(id)!;
  }

  getMessageById(id: string): Message | null {
    if (!this.db) throw new Error('Database not initialized');

    const stmt = this.db.prepare('SELECT * FROM messages WHERE id = ?');
    const row = stmt.get(id) as any;

    if (!row) return null;

    return {
      ...row,
      tool_calls: row.tool_calls ? JSON.parse(row.tool_calls) : undefined,
      tool_results: row.tool_results ? JSON.parse(row.tool_results) : undefined,
      attached_files: row.attached_files ? JSON.parse(row.attached_files) : undefined,
    };
  }

  searchMessages(query: string): Message[] {
    if (!this.db) throw new Error('Database not initialized');

    const stmt = this.db.prepare(`
      SELECT m.* FROM messages m
      INNER JOIN messages_fts fts ON m.rowid = fts.rowid
      WHERE messages_fts MATCH ?
      ORDER BY m.created_at DESC
      LIMIT 50
    `);

    const rows = stmt.all(query) as any[];

    return rows.map(row => ({
      ...row,
      tool_calls: row.tool_calls ? JSON.parse(row.tool_calls) : undefined,
      tool_results: row.tool_results ? JSON.parse(row.tool_results) : undefined,
      attached_files: row.attached_files ? JSON.parse(row.attached_files) : undefined,
    }));
  }

  // Settings operations
  getSetting(key: string): string | null {
    if (!this.db) throw new Error('Database not initialized');

    const stmt = this.db.prepare('SELECT value FROM settings WHERE key = ?');
    const row = stmt.get(key) as { value: string } | undefined;
    return row?.value || null;
  }

  setSetting(key: string, value: string): void {
    if (!this.db) throw new Error('Database not initialized');

    const stmt = this.db.prepare(`
      INSERT INTO settings (key, value) VALUES (?, ?)
      ON CONFLICT(key) DO UPDATE SET value = excluded.value
    `);

    stmt.run(key, value);
  }

  // Skills operations
  getSkills(): any[] {
    if (!this.db) throw new Error('Database not initialized');

    const stmt = this.db.prepare('SELECT * FROM skills ORDER BY created_at DESC');
    return stmt.all();
  }

  addSkill(skill: any): any {
    if (!this.db) throw new Error('Database not initialized');

    const now = Date.now();
    const id = skill.id || uuidv4();

    const stmt = this.db.prepare(`
      INSERT INTO skills (id, filename, name, description, content, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      id,
      skill.filename,
      skill.name,
      skill.description || null,
      skill.content,
      skill.created_at || now
    );

    return this.getSkillById(id);
  }

  getSkillById(id: string): any | null {
    if (!this.db) throw new Error('Database not initialized');

    const stmt = this.db.prepare('SELECT * FROM skills WHERE id = ?');
    return stmt.get(id) || null;
  }

  removeSkill(id: string): boolean {
    if (!this.db) throw new Error('Database not initialized');

    const stmt = this.db.prepare('DELETE FROM skills WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  }

  close(): void {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
  }
}