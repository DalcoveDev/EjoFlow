import { DatabaseSync } from 'node:sqlite';
import { randomUUID } from 'node:crypto';
import path from 'node:path';
import fs from 'node:fs';

const DB_PATH = process.env.DB_PATH ?? path.join(process.cwd(), 'ejoflow.db');
fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });

const db = new DatabaseSync(DB_PATH);
db.exec(`
  PRAGMA journal_mode = WAL;
  CREATE TABLE IF NOT EXISTS conversations (
    id TEXT PRIMARY KEY,
    provider_id TEXT NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS messages (
    id TEXT PRIMARY KEY,
    conversation_id TEXT NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    role TEXT NOT NULL,
    content TEXT NOT NULL,
    ui TEXT,
    created_at TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS actions (
    id TEXT PRIMARY KEY,
    conversation_id TEXT NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    provider TEXT NOT NULL,
    action TEXT NOT NULL,
    ok INTEGER NOT NULL,
    created_at TEXT NOT NULL
  );
  CREATE INDEX IF NOT EXISTS idx_messages_conv ON messages(conversation_id);
  CREATE INDEX IF NOT EXISTS idx_actions_conv ON actions(conversation_id);
  CREATE INDEX IF NOT EXISTS idx_conversations_provider ON conversations(provider_id, updated_at);
`);

function now() {
  return new Date().toISOString();
}

function findConversationByProvider(providerId) {
  return db.prepare('SELECT * FROM conversations WHERE provider_id = ? ORDER BY updated_at DESC LIMIT 1').get(providerId) ?? null;
}

export function getOrCreateConversation(providerId) {
  const existing = findConversationByProvider(providerId);
  if (existing) {
    db.prepare('UPDATE conversations SET updated_at = ? WHERE id = ?').run(now(), existing.id);
    return { id: existing.id, providerId: existing.provider_id };
  }
  const id = randomUUID();
  const t = now();
  db.prepare('INSERT INTO conversations (id, provider_id, created_at, updated_at) VALUES (?, ?, ?, ?)').run(id, providerId, t, t);
  return { id, providerId };
}

export function appendMessage(conversationId, role, content, ui = null) {
  const id = randomUUID();
  const t = now();
  db.prepare('INSERT INTO messages (id, conversation_id, role, content, ui, created_at) VALUES (?, ?, ?, ?, ?, ?)')
    .run(id, conversationId, role, content, ui ? JSON.stringify(ui) : null, t);
  db.prepare('UPDATE conversations SET updated_at = ? WHERE id = ?').run(t, conversationId);
  return { id, role, content, ui: ui ?? null, createdAt: t };
}

export function recordAction(conversationId, provider, action, ok) {
  const id = randomUUID();
  const t = now();
  db.prepare('INSERT INTO actions (id, conversation_id, provider, action, ok, created_at) VALUES (?, ?, ?, ?, ?, ?)')
    .run(id, conversationId, provider, action, ok ? 1 : 0, t);
  return { id, provider, action, ok, createdAt: t };
}

export function lastMessageContent(conversationId) {
  const row = db.prepare('SELECT content FROM messages WHERE conversation_id = ? ORDER BY created_at DESC, rowid DESC LIMIT 1').get(conversationId);
  return row?.content ?? null;
}

export function deleteLastAssistantMessage(conversationId) {
  db.prepare('DELETE FROM messages WHERE id = (SELECT id FROM messages WHERE conversation_id = ? AND role = ? ORDER BY created_at DESC, rowid DESC LIMIT 1)')
    .run(conversationId, 'assistant');
}

export function getConversationHistory(providerId) {
  const conv = findConversationByProvider(providerId);
  if (!conv) return null;
  const messages = db.prepare('SELECT role, content, ui, created_at FROM messages WHERE conversation_id = ? ORDER BY created_at ASC, rowid ASC').all(conv.id)
    .map((m) => ({ role: m.role, content: m.content, ui: m.ui ? JSON.parse(m.ui) : null, createdAt: m.created_at }));
  const actions = db.prepare('SELECT provider, action, ok, created_at FROM actions WHERE conversation_id = ? ORDER BY created_at ASC, rowid ASC').all(conv.id)
    .map((a) => ({ provider: a.provider, action: a.action, ok: a.ok === 1, createdAt: a.created_at }));
  return { id: conv.id, providerId: conv.provider_id, messages, actions };
}

export function listConversations() {
  return db.prepare(`
    SELECT c.id, c.provider_id, c.created_at, c.updated_at,
      COUNT(m.id) AS message_count,
      (SELECT COUNT(*) FROM actions WHERE conversation_id = c.id) AS action_count,
      (SELECT content FROM messages WHERE conversation_id = c.id ORDER BY created_at DESC, rowid DESC LIMIT 1) AS last_message
    FROM conversations c
    LEFT JOIN messages m ON m.conversation_id = c.id
    GROUP BY c.id
    ORDER BY c.updated_at DESC
  `).all();
}

export function listActions(limit = 50) {
  return db.prepare(`
    SELECT a.id, c.provider_id, a.action, a.ok, a.created_at
    FROM actions a
    JOIN conversations c ON c.id = a.conversation_id
    ORDER BY a.created_at DESC, a.rowid DESC
    LIMIT ?
  `).all(limit);
}

export function getStats() {
  const one = (sql) => db.prepare(sql).get().c;
  return {
    conversations: one('SELECT COUNT(*) AS c FROM conversations'),
    messages: one('SELECT COUNT(*) AS c FROM messages'),
    actions: one('SELECT COUNT(*) AS c FROM actions'),
    actionsOk: one('SELECT COUNT(*) AS c FROM actions WHERE ok = 1'),
  };
}