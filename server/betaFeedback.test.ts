import { describe, expect, it } from 'vitest';
import { PARENT_CONTACT_PURGE_QUERY, PARENT_CONTACT_RETENTION_DAYS, validateParentContact } from './betaFeedback';

describe('parent contact validation', () => {
  it('accepts a minimum-data adult support request and does not trust caller context', () => {
    expect(validateParentContact({ kind: 'support', email: ' Parent@Example.com ', message: 'Please help with the Listen button setting.', confirmNoChildData: true, context: 'ignored' })).toEqual({ contact: { kind: 'support', email: 'parent@example.com', message: 'Please help with the Listen button setting.', context: 'Parent contact form' } });
  });

  it('rejects missing adult consent, invalid email, sparse detail, and honeypot payloads', () => {
    expect(validateParentContact({ kind: 'bug', email: 'parent@example.com', message: 'This is enough detail.', confirmNoChildData: false }).error).toMatch(/confirm/i);
    expect(validateParentContact({ kind: 'suggestion', email: 'not-an-email', message: 'This is enough detail.', confirmNoChildData: true }).error).toMatch(/email/i);
    expect(validateParentContact({ kind: 'support', email: 'parent@example.com', message: 'Too short', confirmNoChildData: true }).error).toMatch(/detail/i);
    expect(validateParentContact({ kind: 'support', email: 'parent@example.com', message: 'This is enough detail.', confirmNoChildData: true, website: 'spam' }).error).toMatch(/try again/i);
  });

  it('uses a fixed 30-day maximum retention window for adult contact records', () => {
    expect(PARENT_CONTACT_RETENTION_DAYS).toBe(30);
    expect(PARENT_CONTACT_PURGE_QUERY).toContain('DATE_SUB(UTC_TIMESTAMP(), INTERVAL 30 DAY)');
  });
});
