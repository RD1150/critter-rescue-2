import mysql, { type Pool, type ResultSetHeader } from 'mysql2/promise';

export type BetaFeedbackKind = 'bug' | 'suggestion';
export type BetaFeedback = { kind: BetaFeedbackKind; message: string; context: string };

const MAX_MESSAGE_LENGTH = 1_200;
const MAX_CONTEXT_LENGTH = 120;
let feedbackPool: Pool | null = null;

function asPlainText(value: unknown, maxLength: number): string {
  return typeof value === 'string' ? value.replace(/\u0000/g, '').trim().slice(0, maxLength) : '';
}

export function validateBetaFeedback(payload: unknown): { feedback?: BetaFeedback; error?: string } {
  if (!payload || typeof payload !== 'object') return { error: 'Please write a short note before sending.' };
  const candidate = payload as Record<string, unknown>;
  if (candidate.kind !== 'bug' && candidate.kind !== 'suggestion') return { error: 'Please choose whether this is a bug or a suggestion.' };
  const kind: BetaFeedbackKind = candidate.kind;
  const message = asPlainText(candidate.message, MAX_MESSAGE_LENGTH);
  const context = asPlainText(candidate.context, MAX_CONTEXT_LENGTH) || 'Parent beta feedback';
  if (message.length < 4) return { error: 'Please add a few words so we can understand your note.' };
  return { feedback: { kind, message, context } };
}

function getFeedbackPool(): Pool | null {
  if (feedbackPool) return feedbackPool;
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) return null;
  feedbackPool = mysql.createPool(databaseUrl);
  return feedbackPool;
}

export async function submitBetaFeedback(feedback: BetaFeedback): Promise<number> {
  const db = getFeedbackPool();
  if (!db) throw new Error('Feedback service is not configured.');
  const [result] = await db.execute<ResultSetHeader>(
    'INSERT INTO beta_feedback (kind, message, context) VALUES (?, ?, ?)',
    [feedback.kind, feedback.message, feedback.context],
  );
  return Number(result.insertId);
}
