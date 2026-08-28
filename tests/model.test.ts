import { describe, expect, it, vi } from 'vitest';
import { createSession, demoSession, isValidImport, isValidSession, recommendationFor, upsertAnswer } from '../src/model';

describe('session model', () => {
  it('creates a private session with no ratings', () => {
    vi.stubGlobal('crypto', { randomUUID: () => 'local-id' });
    const session = createSession(new Date('2026-08-28T10:00:00Z'));
    expect(session).toMatchObject({ id: 'local-id', currentStep: 0, answers: [] });
    expect(session.createdAt).toBe('2026-08-28T10:00:00.000Z');
  });

  it('replaces a repeated observation instead of duplicating it', () => {
    const session = createSession(new Date('2026-08-28T10:00:00Z'));
    const first = upsertAnswer(session, { stepId: 'speech', value: 'hard', note: '', assessedAt: '2026-08-28T10:01:00Z' });
    const revised = upsertAnswer(first, { stepId: 'speech', value: 'clear', note: 'after adjustment', assessedAt: '2026-08-28T10:02:00Z' });
    expect(revised.answers).toHaveLength(1);
    expect(revised.answers[0].value).toBe('clear');
  });

  it('gives actionable settings to revisit', () => {
    const session = {
      ...createSession(),
      answers: [
        { stepId: 'channels', value: 'same', note: '', assessedAt: '2026-08-28T10:01:00Z' },
        { stepId: 'interruption', value: 'masked', note: '', assessedAt: '2026-08-28T10:02:00Z' }
      ]
    };
    expect(recommendationFor(session)).toEqual([
      'Revisit the operating system Mono audio setting and channel balance.',
      'Lower notification volume or reduce audio ducking.'
    ]);
  });

  it('strictly validates every imported field and date', () => {
    const valid = demoSession();
    expect(isValidImport([{ id: 'x' }])).toBe(false);
    expect(isValidImport(null)).toBe(false);
    expect(isValidImport([valid])).toBe(true);
    expect(isValidSession({
      id: 'corrupt-row',
      createdAt: valid.createdAt,
      updatedAt: valid.updatedAt,
      currentStep: 0,
      answers: [],
      completedAt: 'not-a-date'
    })).toBe(false);
    expect(isValidImport([{ ...valid, answers: [{ ...valid.answers[0], value: 'unknown' }] }])).toBe(false);
    expect(isValidImport([{ ...valid, settings: { ...valid.settings, systemVolume: 101 } }])).toBe(false);
  });
});
