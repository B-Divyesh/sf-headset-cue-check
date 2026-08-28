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

const isRecord = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === 'object' && !Array.isArray(value);

const isDate = (value: unknown): value is string =>
  typeof value === 'string' && value.length <= 40 && Number.isFinite(Date.parse(value));

const isText = (value: unknown, maximum: number): value is string =>
  typeof value === 'string' && value.length <= maximum;

const isOneOf = <T extends string>(value: unknown, choices: readonly T[]): value is T =>
  typeof value === 'string' && choices.includes(value as T);

function isValidRating(value: unknown): value is Rating {
  if (!isRecord(value)) return false;
  const step = STEPS.find(item => item.id === value.stepId);
  return Boolean(step) && isOneOf(value.value, step!.options.map(option => option.value)) &&
    isText(value.note, 240) && isDate(value.assessedAt);
}

function isValidSettings(value: unknown): value is SetupSettings {
  if (!isRecord(value)) return false;
  return isText(value.platform, 40) && isText(value.deviceName, 80) && value.deviceName.trim().length > 0 &&
    typeof value.systemVolume === 'number' && Number.isInteger(value.systemVolume) && value.systemVolume >= 0 && value.systemVolume <= 100 &&
    typeof value.screenReaderVolume === 'number' && Number.isInteger(value.screenReaderVolume) && value.screenReaderVolume >= 0 && value.screenReaderVolume <= 100 &&
    isOneOf(value.monoAudio, ['Off', 'On', 'Revisit']) &&
    isOneOf(value.spatialAudio, ['Off', 'On', 'Revisit']) &&
    isOneOf(value.audioDucking, ['Off', 'On', 'Revisit']) &&
    isOneOf(value.notificationStyle, ['Gentle', 'Balanced', 'Distinct']) &&
    isText(value.notes, 400);
}

export function isValidSession(value: unknown): value is CheckSession {
  if (!isRecord(value)) return false;
  if (typeof value.id !== 'string' || !/^[a-zA-Z0-9-]{1,80}$/.test(value.id)) return false;
  if (!isDate(value.createdAt) || !isDate(value.updatedAt)) return false;
  if (!Number.isInteger(value.currentStep) || (value.currentStep as number) < 0 || (value.currentStep as number) >= STEPS.length) return false;
  if (!Array.isArray(value.answers) || value.answers.length > STEPS.length || !value.answers.every(isValidRating)) return false;
  const stepIds = value.answers.map(answer => answer.stepId);
  if (new Set(stepIds).size !== stepIds.length) return false;
  if (value.settings !== undefined && !isValidSettings(value.settings)) return false;
  if (value.completedAt !== undefined && (!isDate(value.completedAt) || !isValidSettings(value.settings))) return false;
  return true;
}

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
  return Array.isArray(value) && value.length <= 500 && value.every(isValidSession);
}

export function demoSession(): CheckSession {
  return {
    id: 'demo-accessibility-lab-headset',
    createdAt: '2026-08-28T09:20:00.000Z',
    updatedAt: '2026-08-28T09:31:00.000Z',
    completedAt: '2026-08-28T09:31:00.000Z',
    currentStep: 5,
    answers: [
      { stepId: 'speech', value: 'clear', note: 'Clear at the normal working level.', assessedAt: '2026-08-28T09:21:00.000Z' },
      { stepId: 'channels', value: 'matched', note: '', assessedAt: '2026-08-28T09:22:00.000Z' },
      { stepId: 'mono', value: 'all', note: 'All tones stayed present with Mono audio on.', assessedAt: '2026-08-28T09:24:00.000Z' },
      { stepId: 'level', value: 'comfortable', note: '', assessedAt: '2026-08-28T09:26:00.000Z' },
      { stepId: 'interruption', value: 'masked', note: 'The alert covered the last word.', assessedAt: '2026-08-28T09:28:00.000Z' },
      { stepId: 'notification', value: 'distinct', note: 'Distinct remained noticeable during speech.', assessedAt: '2026-08-28T09:29:00.000Z' }
    ],
    settings: {
      platform: 'Windows',
      deviceName: 'Accessibility lab headset',
      systemVolume: 38,
      screenReaderVolume: 62,
      monoAudio: 'On',
      spatialAudio: 'Off',
      audioDucking: 'Revisit',
      notificationStyle: 'Distinct',
      notes: 'Use the rear USB port. Recheck audio ducking before moderated sessions.'
    }
  };
}
