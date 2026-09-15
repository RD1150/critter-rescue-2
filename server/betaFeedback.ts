import mysql, { type Pool, type ResultSetHeader } from 'mysql2/promise';

export type ParentContactKind = 'bug' | 'suggestion' | 'support';
export type ParentContact = { kind: ParentContactKind; email: string; message: string; context: string };

const MAX_MESSAGE_LENGTH = 1_200;
const MAX_EMAIL_LENGTH = 254;
let feedbackPool: Pool | null = null;

function asPlainText(value: unknown, maxLength: number): string {
  return typeof value === 'string' ? value.replace(/\u0000/g, '').trim().slice(0, maxLength) : '';
}

function isPlausibleEmail(value: string): boolean {
  return value.length <= MAX_EMAIL_LENGTH && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function validateParentContact(payload: unknown): { contact?: ParentContact; error?: string } {
  if (!payload || typeof payload !== 'object') return { error: 'Please complete the parent contact form before sending.' };
  const candidate = payload as Record<string, unknown>;
  if (candidate.website) return { error: 'Please try again in a moment.' };
  if (candidate.kind !== 'bug' && candidate.kind !== 'suggestion' && candidate.kind !== 'support') return { error: 'Please choose the kind of parent message you are sending.' };
  if (candidate.confirmNoChildData !== true) return { error: 'Please confirm that the message does not include child private information.' };
  const email = asPlainText(candidate.email, MAX_EMAIL_LENGTH).toLowerCase();
  const message = asPlainText(candidate.message, MAX_MESSAGE_LENGTH);
  if (!isPlausibleEmail(email)) return { error: 'Please enter a valid grown-up email address.' };
  if (message.length < 12) return { error: 'Please add a little more detail so we can understand the request.' };
  return { contact: { kind: candidate.kind, email, message, context: 'Parent contact form' } };
}

function getFeedbackPool(): Pool | null {
  if (feedbackPool) return feedbackPool;
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) return null;
  feedbackPool = mysql.createPool(databaseUrl);
  return feedbackPool;
}

export async function submitParentContact(contact: ParentContact): Promise<number> {
  const db = getFeedbackPool();
  if (!db) throw new Error('Parent contact service is not configured.');
  const [result] = await db.execute<ResultSetHeader>(
    'INSERT INTO beta_feedback (kind, email, message, context) VALUES (?, ?, ?, ?)',
    [contact.kind, contact.email, contact.message, contact.context],
  );
  return Number(result.insertId);
}
