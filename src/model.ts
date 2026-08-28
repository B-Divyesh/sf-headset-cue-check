export type Rating = {
  stepId: string;
  value: string;
  note: string;
  assessedAt: string;
};

export type SetupSettings = {
  platform: string;
  deviceName: string;
  systemVolume: number;
  screenReaderVolume: number;
  monoAudio: 'Off' | 'On' | 'Revisit';
  spatialAudio: 'Off' | 'On' | 'Revisit';
  audioDucking: 'Off' | 'On' | 'Revisit';
  notificationStyle: 'Gentle' | 'Balanced' | 'Distinct';
  notes: string;
};

export type CheckSession = {
  id: string;
  createdAt: string;
  updatedAt: string;
  currentStep: number;
  answers: Rating[];
  settings?: SetupSettings;
  completedAt?: string;
};

export type Step = {
  id: string;
  specimen: string;
  title: string;
  instruction: string;
  listenFor: string;
  cueLabel: string;
  options: { value: string; label: string; hint?: string }[];
};

export const STEPS: Step[] = [
  {
    id: 'speech', specimen: '01', title: 'Speech clarity', cueLabel: 'Play speech sample',
    instruction: 'Listen to one short sentence at a normal speaking pace.',
    listenFor: 'Notice consonants, word endings, and whether listening takes effort.',
    options: [
      { value: 'clear', label: 'Every word was clear' },
      { value: 'effort', label: 'I understood it with some effort' },
      { value: 'hard', label: 'It was hard to follow' },
      { value: 'unable', label: 'Could not assess this cue' }
    ]
  },
  {
    id: 'channels', specimen: '02', title: 'Left and right', cueLabel: 'Play left and right cues',
    instruction: 'A voice says “left channel” on the left, then “right channel” on the right.',
    listenFor: 'Check that the labels match the side you hear. Keep the headset in its normal position.',
    options: [
      { value: 'matched', label: 'Left and right matched' },
      { value: 'reversed', label: 'The sides sounded reversed' },
      { value: 'same', label: 'Both sounded on the same side' },
      { value: 'unable', label: 'Could not assess this cue' }
    ]
  },
  {
    id: 'mono', specimen: '03', title: 'Mono compatibility', cueLabel: 'Play channel-to-center sequence',
    instruction: 'Three brief tones move from left, to right, to the center.',
    listenFor: 'If you use mono audio, confirm all three tones remain present and similarly easy to notice.',
    options: [
      { value: 'all', label: 'All three stayed easy to hear' },
      { value: 'lost', label: 'One tone was missing or much softer' },
      { value: 'uneven', label: 'The sequence felt uneven or uncomfortable' },
      { value: 'unable', label: 'Could not assess this cue' }
    ]
  },
  {
    id: 'level', specimen: '04', title: 'Working level', cueLabel: 'Play soft and working levels',
    instruction: 'The same sentence plays softly, then at a normal working level.',
    listenFor: 'Choose a level that is clear without feeling sharp. Use the device controls if needed, then record the percentage later.',
    options: [
      { value: 'comfortable', label: 'The working level felt comfortable' },
      { value: 'quiet', label: 'It was too quiet' },
      { value: 'loud', label: 'It was too loud' },
      { value: 'unable', label: 'Could not assess this cue' }
    ]
  },
  {
    id: 'interruption', specimen: '05', title: 'Speech with an alert', cueLabel: 'Play speech and alert together',
    instruction: 'A short alert sounds while the sentence is playing.',
    listenFor: 'Decide whether you notice the alert without losing too much of the spoken sentence.',
    options: [
      { value: 'balanced', label: 'The alert and speech felt balanced' },
      { value: 'masked', label: 'The alert covered too much speech' },
      { value: 'subtle', label: 'The alert was too subtle' },
      { value: 'unable', label: 'Could not assess this cue' }
    ]
  },
  {
    id: 'notification', specimen: '06', title: 'Notification character', cueLabel: 'Play notification choices',
    instruction: 'Hear gentle, balanced, and distinct versions of the same notification.',
    listenFor: 'Choose the least intrusive version you would still notice during screen-reader speech.',
    options: [
      { value: 'gentle', label: 'Gentle', hint: 'A soft, lower bell' },
      { value: 'balanced', label: 'Balanced', hint: 'A clear two-note cue' },
      { value: 'distinct', label: 'Distinct', hint: 'A brighter three-note cue' },
      { value: 'unable', label: 'Could not assess this cue' }
    ]
  }
];

export const DEFAULT_SETTINGS: SetupSettings = {
  platform: 'Windows', deviceName: '', systemVolume: 50, screenReaderVolume: 50,
  monoAudio: 'Revisit', spatialAudio: 'Off', audioDucking: 'Revisit',
  notificationStyle: 'Balanced', notes: ''
};

export function createSession(now = new Date()): CheckSession {
  const stamp = now.toISOString();
  return { id: crypto.randomUUID(), createdAt: stamp, updatedAt: stamp, currentStep: 0, answers: [] };
}

export function upsertAnswer(session: CheckSession, answer: Rating): CheckSession {
  const answers = session.answers.filter(item => item.stepId !== answer.stepId);
  answers.push(answer);
  return { ...session, answers, updatedAt: answer.assessedAt };
}

export function recommendationFor(session: CheckSession): string[] {
  const answer = (id: string) => session.answers.find(item => item.stepId === id)?.value;
  const notes: string[] = [];
  if (answer('channels') === 'reversed') notes.push('Check headset orientation and the operating system’s left/right balance.');
  if (answer('channels') === 'same' || answer('mono') === 'lost') notes.push('Revisit the operating system Mono audio setting and channel balance.');
  if (answer('level') === 'quiet') notes.push('Raise volume gradually and repeat the speech cue before a long session.');
  if (answer('level') === 'loud') notes.push('Lower system or screen-reader volume before a long session.');
  if (answer('interruption') === 'masked') notes.push('Lower notification volume or reduce audio ducking.');
  if (answer('interruption') === 'subtle') notes.push('Choose a more distinct notification cue or raise its volume.');
  if (!notes.length) notes.push('Your observations did not flag a specific setting. Keep this card as your repeatable baseline.');
  return notes;
}

export function isValidImport(value: unknown): value is CheckSession[] {
  return Array.isArray(value) && value.every(item => {
    if (!item || typeof item !== 'object') return false;
    const row = item as Partial<CheckSession>;
    return typeof row.id === 'string' && typeof row.createdAt === 'string' &&
      typeof row.updatedAt === 'string' && Array.isArray(row.answers);
  });
}
