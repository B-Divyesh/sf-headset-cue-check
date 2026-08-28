import './style.css';
import { CuePlayer, type CueId, type NotificationStyle } from './audio';
import {
  DEFAULT_SETTINGS, STEPS, createSession, demoSession, isValidImport, recommendationFor, upsertAnswer,
  type CheckSession, type SetupSettings
} from './model';
import { allSessions, clearSessions, mergeSessions, removeSession, saveSession, useDemoStorage } from './storage';

type View = 'home' | 'check' | 'setup' | 'card';

const appNode = document.querySelector<HTMLDivElement>('#app');
if (!appNode) throw new Error('App root is missing.');
const app: HTMLDivElement = appNode;

const player = new CuePlayer();
let sessions: CheckSession[] = [];
let session: CheckSession | undefined;
let view: View = 'home';
let storageError = '';
let recentlyRemoved: CheckSession | undefined;
const demoMode = location.pathname.replace(/\/$/, '') === '/demo' || new URLSearchParams(location.search).get('demo') === '1';
const BUILD_ID = '1.0.1-repair.1';

const escapeHtml = (value: string | number) => String(value).replace(/[&<>'"]/g, character => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
}[character] ?? character));

const formatDate = (stamp: string) => {
  const date = new Date(stamp);
  return Number.isFinite(date.getTime()) ? new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium', timeStyle: 'short'
  }).format(date) : 'Date unavailable';
};

const optionLabel = (stepId: string, value: string) => STEPS.find(step => step.id === stepId)
  ?.options.find(option => option.value === value)?.label ?? value;

function shell(content: string): string {
  return `
    <header class="site-header">
      <a class="brand" href="/" data-route aria-label="Headset Cue Check home">
        <span class="brand-mark" aria-hidden="true">⌒</span>
        <span>Headset Cue Check</span>
      </a>
      <nav aria-label="Utility">
        <a href="/demo">Demo</a>
        <a href="/privacy" data-route>Privacy</a>
        <a href="/terms" data-route>Terms</a>
      </nav>
    </header>
    <div id="connection" class="connection ${navigator.onLine ? 'is-hidden' : ''}" role="status">Offline — the guide and your saved cards still work.</div>
    ${demoMode ? `<aside class="demo-banner" aria-label="Demo mode"><strong>Demo — sample data, nothing is saved</strong><span>Changes stay separate from your setup cards.</span><div><button class="text-button" id="reset-demo">Reset demo</button><a href="/" class="text-link">Start for real</a></div></aside>` : ''}
    ${recentlyRemoved ? `<div class="undo-bar" role="status">Check removed. <button class="text-button" id="undo-remove">Undo</button></div>` : ''}
    ${content}
    <footer>
      <p><span aria-hidden="true">❧</span> Headset listening checks for screen-reader users and accessibility staff.</p>
      <p>Built by Param Factory · ${BUILD_ID}<br />Original AI-assisted field-guide illustration.</p>
      <nav aria-label="Footer"><a href="/demo">Demo</a><a href="/privacy" data-route>Privacy</a><a href="/terms" data-route>Terms</a></nav>
    </footer>
    <div id="live-status" class="sr-only" aria-live="polite" aria-atomic="true"></div>
    <div id="update-toast" class="toast is-hidden" role="status"><span>A fresh field guide is ready.</span><button id="reload-app">Reload</button></div>`;
}

function homePage(): string {
  const active = sessions.find(item => !item.completedAt);
  const completed = sessions.filter(item => item.completedAt);
  return shell(`<main id="main">
    <section class="hero" aria-labelledby="page-title">
      <div class="hero-copy">
        <p class="eyebrow">A six-observation listening guide</p>
        <h1 id="page-title" tabindex="-1">Check the headset cues your work depends on.</h1>
        <p class="lede">For screen-reader users and accessibility staff who need repeatable speech, channel, level, and alert settings.</p>
        <div class="hero-actions">
          ${demoMode ? `<button class="secondary" id="start-check">Start a sample check</button>` : `<a class="primary" href="/demo">Try it with sample data</a>${active ? `<button class="secondary" id="resume-check">Resume observation ${Math.min(active.currentStep + 1, 6)} of 6</button>` : `<button class="secondary" id="start-check">Start your check</button>`}`}
        </div>
        <ul class="hero-facts" aria-label="Product facts"><li>Free to use.</li><li>Your notes and cards stay in this browser.</li><li>Works offline after your first visit.</li></ul>
        <div class="notice" role="note"><strong>This is not a hearing or audiology test.</strong> It does not diagnose, certify hardware, or change system settings. Your browser plays to the output selected in your operating system.</div>
      </div>
      <figure class="specimen-figure">
        <img src="/assets/headset-specimen.webp" width="1200" height="800" fetchpriority="high" decoding="async" alt="Over-ear headphones arranged on specimen paper beside two leaves and a tuning fork." />
        <figcaption><span>Plate H–01</span> Listen, notice, record.</figcaption>
      </figure>
    </section>
    <section class="preflight" aria-labelledby="before-title">
      <div><p class="section-number" aria-hidden="true">FIELD NOTE / HOW IT WORKS</p><h2 id="before-title">Complete the check in three steps</h2></div>
      <ol class="preflight-list">
        <li><span>1</span><div><strong>Select the headset</strong><p>Choose it in your operating system. Begin at a low volume.</p></div></li>
        <li><span>2</span><div><strong>Play and rate six cues</strong><p>Record what you notice about speech, channels, levels, and alerts.</p></div></li>
        <li><span>3</span><div><strong>Save the settings</strong><p>Keep a local setup card you can repeat later.</p></div></li>
      </ol>
    </section>
    <section class="library" aria-labelledby="library-title">
      <div class="library-heading"><div><p class="section-number">YOUR LOCAL SPECIMENS</p><h2 id="library-title">Saved setup cards</h2></div>
        <div class="library-actions"><button class="secondary small" id="export-all" ${completed.length ? '' : 'disabled'}>Export JSON</button><label class="secondary small file-label"><span>Import JSON</span><input id="import-file" class="file-input" type="file" accept="application/json,.json" /></label></div>
      </div>
      ${storageError ? `<p class="error" role="alert">${escapeHtml(storageError)} Your check can continue, but it may not survive closing this tab.</p>` : ''}
      ${completed.length ? `<ul class="saved-list">${completed.map(item => `<li><div><strong>${escapeHtml(item.settings?.deviceName || 'Unnamed headset')}</strong><span>${escapeHtml(item.settings?.platform || 'Platform not recorded')} · ${formatDate(item.completedAt!)}</span></div><div><button class="text-button open-card" data-id="${item.id}">Open card</button><button class="text-button danger-button remove-card" data-id="${item.id}" aria-label="Remove setup card for ${escapeHtml(item.settings?.deviceName || 'unnamed headset')}">Remove</button></div></li>`).join('')}</ul>` : `<div class="empty-state"><span aria-hidden="true">⌁</span><p><strong>No setup cards yet.</strong><br />Finish one check and its settings will appear here.</p></div>`}
    </section>
  </main>`);
}

function progressMarkup(index: number): string {
  return `<div class="progress-wrap"><div class="progress-copy"><span>Observation ${index + 1} of ${STEPS.length}</span><span>${Math.round(((index + 1) / STEPS.length) * 100)}%</span></div><div class="progress progress-step-${index + 1}" role="progressbar" aria-label="Check progress" aria-valuemin="1" aria-valuemax="6" aria-valuenow="${index + 1}"><span></span></div></div>`;
}

function checkPage(): string {
  if (!session) return homePage();
  const step = STEPS[session.currentStep];
  const answer = session.answers.find(item => item.stepId === step.id);
  return shell(`<main id="main" class="check-layout">
    <aside class="specimen-index" aria-label="Observation index"><p>SPECIMEN INDEX</p><ol>${STEPS.map((item, index) => `<li class="${index === session!.currentStep ? 'current' : ''} ${session!.answers.some(answerItem => answerItem.stepId === item.id) ? 'done' : ''}"><span>${item.specimen}</span>${escapeHtml(item.title)}${index < session!.currentStep ? '<span class="sr-only"> completed</span>' : ''}</li>`).join('')}</ol></aside>
    <section class="observation" aria-labelledby="observation-title">
      ${progressMarkup(session.currentStep)}
      <div class="observation-heading"><span class="leaf-number" aria-hidden="true">${step.specimen}</span><div><p class="eyebrow">Listening observation</p><h1 id="observation-title" tabindex="-1">${escapeHtml(step.title)}</h1></div></div>
      <p class="instruction">${escapeHtml(step.instruction)}</p>
      <div class="listen-note"><span aria-hidden="true">❧</span><div><strong>Listen for</strong><p>${escapeHtml(step.listenFor)}</p></div></div>
      ${step.id === 'notification' ? `<fieldset class="cue-variants"><legend>Choose a version, then play it</legend>${step.options.slice(0, 3).map(option => `<label><input type="radio" name="cue-style" value="${option.value}" ${(answer?.value ?? 'balanced') === option.value ? 'checked' : ''}/><span><strong>${option.label}</strong><small>${option.hint}</small></span></label>`).join('')}</fieldset>` : ''}
      <div class="cue-panel">
        <button class="play-button" id="play-cue" data-cue="${step.id}"><span class="play-symbol" aria-hidden="true">▶</span><span>${escapeHtml(step.cueLabel)}</span></button>
        <button class="stop-button" id="stop-cue">Stop audio</button>
        <p id="audio-state" aria-live="assertive">Ready. Audio plays only after you press the button.</p>
      </div>
      <form id="rating-form">
        <fieldset class="rating-fieldset"><legend>What did you notice?</legend>
          <div class="rating-options">${step.options.map((option, index) => `<label><input type="radio" name="rating" value="${option.value}" ${answer?.value === option.value ? 'checked' : ''}/><span><b aria-hidden="true">${String.fromCharCode(65 + index)}</b><span>${escapeHtml(option.label)}</span></span></label>`).join('')}</div>
        </fieldset>
        <div class="note-field"><label for="observation-note">Optional note</label><textarea id="observation-note" rows="2" maxlength="240" placeholder="For example: clearer with spatial audio off">${escapeHtml(answer?.note ?? '')}</textarea></div>
        <p id="form-error" class="error is-hidden" role="alert"></p>
        <div class="form-actions"><button type="button" class="secondary" id="previous-step" ${session.currentStep === 0 ? 'disabled' : ''}>Previous</button><button type="submit" class="primary">${session.currentStep === STEPS.length - 1 ? 'Record settings' : 'Save and continue'}</button></div>
      </form>
      <button class="text-button exit-check" id="exit-check">Save and finish later</button>
    </section>
  </main>`);
}

function setupPage(): string {
  if (!session) return homePage();
  const selected = session.answers.find(answer => answer.stepId === 'notification')?.value;
  const defaults = session.settings ?? { ...DEFAULT_SETTINGS, notificationStyle: selected === 'gentle' || selected === 'distinct' ? `${selected[0].toUpperCase()}${selected.slice(1)}` as SetupSettings['notificationStyle'] : 'Balanced' };
  const select = (value: string, current: string) => value === current ? 'selected' : '';
  return shell(`<main id="main" class="setup-page">
    <p class="eyebrow">Final field note</p><h1 id="setup-title" tabindex="-1">Record the settings you can reproduce.</h1>
    <p class="lede">Copy the values from your operating system and screen reader. This guide cannot read or change them for you.</p>
    <form id="settings-form" class="settings-form">
      <div class="form-section"><h2>Device</h2><div class="field-grid">
        <label>Operating system<select name="platform">${['Windows','macOS','iOS / iPadOS','Android','ChromeOS','Linux','Other'].map(value => `<option ${select(value, defaults.platform)}>${value}</option>`).join('')}</select></label>
        <label>Headset name<input name="deviceName" value="${escapeHtml(defaults.deviceName)}" maxlength="80" required aria-describedby="device-hint" /></label><small id="device-hint">Use the name shown in the system output menu.</small>
      </div></div>
      <div class="form-section"><h2>Levels</h2><div class="field-grid sliders">
        <label>System output <output id="system-output">${defaults.systemVolume}%</output><input type="range" name="systemVolume" min="0" max="100" value="${defaults.systemVolume}" /></label>
        <label>Screen-reader speech <output id="reader-output">${defaults.screenReaderVolume}%</output><input type="range" name="screenReaderVolume" min="0" max="100" value="${defaults.screenReaderVolume}" /></label>
      </div></div>
      <div class="form-section"><h2>Accessibility audio</h2><div class="field-grid three">
        <label>Mono audio<select name="monoAudio">${['Off','On','Revisit'].map(value => `<option ${select(value, defaults.monoAudio)}>${value}</option>`).join('')}</select></label>
        <label>Spatial audio<select name="spatialAudio">${['Off','On','Revisit'].map(value => `<option ${select(value, defaults.spatialAudio)}>${value}</option>`).join('')}</select></label>
        <label>Audio ducking<select name="audioDucking">${['Off','On','Revisit'].map(value => `<option ${select(value, defaults.audioDucking)}>${value}</option>`).join('')}</select></label>
        <label>Notification character<select name="notificationStyle">${['Gentle','Balanced','Distinct'].map(value => `<option ${select(value, defaults.notificationStyle)}>${value}</option>`).join('')}</select></label>
      </div></div>
      <div class="form-section"><label for="settings-notes"><h2>Anything else to repeat?</h2></label><textarea id="settings-notes" name="notes" rows="3" maxlength="400">${escapeHtml(defaults.notes)}</textarea></div>
      <p id="settings-error" class="error is-hidden" role="alert"></p>
      <div class="form-actions"><button type="button" class="secondary" id="back-to-check">Back to observations</button><button type="submit" class="primary">Create setup card</button></div>
    </form>
  </main>`);
}

function cardPage(): string {
  if (!session?.settings) return homePage();
  const settings = session.settings;
  return shell(`<main id="main" class="card-page">
    <div class="card-intro"><div><p class="eyebrow">Setup specimen complete</p><h1 id="card-title" tabindex="-1">Your repeatable headset setup</h1><p>Saved only in this browser on ${formatDate(session.completedAt ?? session.updatedAt)}.</p></div><span class="completion-mark" aria-hidden="true">✓</span></div>
    <article class="setup-card" aria-labelledby="setup-card-title">
      <header><div><p>HEADSET CUE CHECK / LOCAL CARD</p><h2 id="setup-card-title">${escapeHtml(settings.deviceName)}</h2></div><span>${escapeHtml(settings.platform)}</span></header>
      <section class="setting-values" aria-label="Recorded settings"><dl>
        <div><dt>System output</dt><dd>${settings.systemVolume}%</dd></div><div><dt>Screen-reader speech</dt><dd>${settings.screenReaderVolume}%</dd></div>
        <div><dt>Mono audio</dt><dd>${settings.monoAudio}</dd></div><div><dt>Spatial audio</dt><dd>${settings.spatialAudio}</dd></div>
        <div><dt>Audio ducking</dt><dd>${settings.audioDucking}</dd></div><div><dt>Notifications</dt><dd>${settings.notificationStyle}</dd></div>
      </dl></section>
      ${settings.notes ? `<section><h3>Your repeat note</h3><p class="user-note">${escapeHtml(settings.notes)}</p></section>` : ''}
      <section><h3>Observations</h3><ol class="result-list">${STEPS.map(step => { const answer = session!.answers.find(item => item.stepId === step.id); return `<li><span>${step.specimen}</span><div><strong>${escapeHtml(step.title)}</strong><p>${escapeHtml(answer ? optionLabel(step.id, answer.value) : 'Not recorded')}</p>${answer?.note ? `<small>${escapeHtml(answer.note)}</small>` : ''}</div></li>`; }).join('')}</ol></section>
      <section class="revisit"><h3>Settings to revisit</h3><ul>${recommendationFor(session).map(note => `<li>${escapeHtml(note)}</li>`).join('')}</ul></section>
      <p class="card-limit"><strong>Browser limit:</strong> This card records what you entered; it does not verify hardware routing or system settings. It is not a hearing test.</p>
    </article>
    <div class="card-actions"><button class="primary" id="copy-card">Copy summary</button><button class="secondary" id="print-card">Print card</button><button class="secondary" id="export-card">Export JSON</button><button class="text-button" id="home-button">Back to home</button></div>
  </main>`);
}

function legalPage(kind: 'privacy' | 'terms'): string {
  const privacy = kind === 'privacy';
  return shell(`<main id="main" class="legal-page"><p class="eyebrow">${privacy ? 'Privacy note' : 'Terms of use'}</p><h1 tabindex="-1">${privacy ? 'Your listening notes stay yours.' : 'A practical guide, not a diagnosis.'}</h1><p class="updated">Effective 28 August 2026</p>
    ${privacy ? `<section><h2>What is stored</h2><p>Headset Cue Check stores your cue ratings, optional notes, setup values, and completion dates in IndexedDB in this browser. Nothing is sent to Sociobot or another server. The app includes no analytics, advertising, tracking pixels, accounts, or third-party runtime scripts.</p></section><section><h2>Your controls</h2><p>You can export your cards as JSON, import them on another device, or remove them from the home screen. Clearing this site’s browser data also removes every saved card. An exported file is outside the app’s control, so keep it where you are comfortable.</p></section><section><h2>Network and audio</h2><p>The first visit downloads the app shell, illustration, and speech samples. A service worker then keeps those resources for offline use. Audio is generated or played locally. The browser may expose ordinary request metadata, such as an IP address, to the hosting provider when files are downloaded; the product does not retain a user profile.</p></section>` : `<section><h2>Purpose and limits</h2><p>This free utility helps you observe how a headset handles speech, channels, levels, and alerts in your own workflow. It is not a medical or audiology test, hearing protection advice, hardware certification, or a substitute for a qualified professional.</p></section><section><h2>Use safely</h2><p>Begin at low volume and stop if sound feels uncomfortable. You remain responsible for selecting the intended audio output and confirming operating-system settings. Browsers cannot reliably identify the physical device receiving audio.</p></section><section><h2>No warranty</h2><p>The software is provided “as is,” without warranty of any kind, as described in the MIT License. Results are personal observations, not pass/fail findings. Do not rely on this utility alone for safety-critical or regulated work.</p></section>`}
    <p><a class="legal-return" href="/" data-route>Return to Headset Cue Check</a></p></main>`);
}

function notFoundPage(): string {
  return shell(`<main id="main" class="legal-page not-found"><p class="eyebrow">Field note / 404</p><h1 tabindex="-1">This listening path is not in the guide.</h1><p>The address may have changed. Return home to start a headset check or open the sample.</p><p><a class="legal-return" href="/" data-route>Return to Headset Cue Check</a></p></main>`);
}

function render(options: { focus?: boolean } = {}): void {
  const path = location.pathname.replace(/\/$/, '') || '/';
  const knownHome = path === '/' || path === '/demo';
  document.title = path === '/privacy' ? 'Privacy — Headset Cue Check' : path === '/terms' ? 'Terms — Headset Cue Check' : path === '/demo' ? 'Demo — Headset Cue Check' : knownHome ? 'Headset Cue Check — check speech and alert cues' : 'Page not found — Headset Cue Check';
  if (path === '/privacy' || path === '/terms') app.innerHTML = legalPage(path.slice(1) as 'privacy' | 'terms');
  else if (!knownHome) app.innerHTML = notFoundPage();
  else app.innerHTML = view === 'check' ? checkPage() : view === 'setup' ? setupPage() : view === 'card' ? cardPage() : homePage();
  bindEvents();
  if (options.focus) requestAnimationFrame(() => document.querySelector<HTMLElement>('main h1')?.focus());
}

async function persist(): Promise<void> {
  if (!session) return;
  try { await saveSession(session); await refreshSessions(); }
  catch (error) { storageError = error instanceof Error ? error.message : 'Local saving is unavailable.'; }
}

async function refreshSessions(): Promise<void> {
  const loaded = await allSessions();
  sessions = loaded.sessions;
  if (loaded.discarded) storageError = `${loaded.discarded} damaged saved ${loaded.discarded === 1 ? 'check was' : 'checks were'} removed. Your other cards are safe.`;
}

function announce(message: string): void {
  const node = document.querySelector<HTMLElement>('#live-status');
  if (node) node.textContent = message;
}

function download(filename: string, data: unknown): void {
  const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }));
  const link = document.createElement('a'); link.href = url; link.download = filename; link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function cardSummary(item: CheckSession): string {
  if (!item.settings) return '';
  const s = item.settings;
  return `Headset Cue Check — ${s.deviceName}\n${s.platform}\nSystem output: ${s.systemVolume}%\nScreen-reader speech: ${s.screenReaderVolume}%\nMono audio: ${s.monoAudio}\nSpatial audio: ${s.spatialAudio}\nAudio ducking: ${s.audioDucking}\nNotifications: ${s.notificationStyle}\n\nSettings to revisit:\n${recommendationFor(item).map(text => `- ${text}`).join('\n')}\n\nNot a hearing test. Browser audio routing was not verified.`;
}

function bindEvents(): void {
  document.querySelectorAll<HTMLAnchorElement>('[data-route]').forEach(link => link.addEventListener('click', event => {
    if (event.button !== 0 || event.metaKey || event.ctrlKey) return;
    event.preventDefault(); history.pushState({}, '', link.pathname); view = 'home'; render({ focus: true });
  }));
  document.querySelector('#start-check')?.addEventListener('click', async () => {
    const unfinished = sessions.find(item => !item.completedAt);
    if (unfinished) {
      if (!confirm(`Start a new check and discard the unfinished check at observation ${unfinished.currentStep + 1}?`)) return;
      try { await removeSession(unfinished.id); } catch { /* the in-memory check can still start */ }
    }
    player.stop(); session = createSession(); view = 'check'; await persist(); render({ focus: true });
  });
  document.querySelector('#resume-check')?.addEventListener('click', () => {
    session = sessions.find(item => !item.completedAt); if (session) { view = 'check'; render({ focus: true }); }
  });
  document.querySelector('#exit-check')?.addEventListener('click', async () => { player.stop(); await persist(); view = 'home'; render({ focus: true }); });
  document.querySelector('#previous-step')?.addEventListener('click', () => { if (session && session.currentStep > 0) { player.stop(); session.currentStep -= 1; render({ focus: true }); } });
  document.querySelector('#back-to-check')?.addEventListener('click', () => { view = 'check'; if (session) session.currentStep = STEPS.length - 1; render({ focus: true }); });

  const audioState = document.querySelector<HTMLElement>('#audio-state');
  const playButton = document.querySelector<HTMLButtonElement>('#play-cue');
  player.onState = (message, playing) => {
    if (audioState) { audioState.textContent = message; audioState.classList.toggle('playing', playing); }
    if (playButton) { playButton.disabled = playing; playButton.setAttribute('aria-busy', String(playing)); }
  };
  playButton?.addEventListener('click', async () => {
    try { await player.play(playButton.dataset.cue as CueId); } catch { /* status is announced by the player */ }
  });
  document.querySelector('#stop-cue')?.addEventListener('click', () => { player.stop(); player.onState?.('Audio stopped.', false); });
  document.querySelectorAll<HTMLInputElement>('input[name="cue-style"]').forEach(input => input.addEventListener('change', () => player.setNotificationStyle(input.value as NotificationStyle)));

  document.querySelector<HTMLFormElement>('#rating-form')?.addEventListener('submit', async event => {
    event.preventDefault();
    if (!session) return;
    const data = new FormData(event.currentTarget as HTMLFormElement);
    const value = data.get('rating');
    if (typeof value !== 'string') {
      const error = document.querySelector<HTMLElement>('#form-error');
      if (error) { error.textContent = 'Choose what you noticed, or choose “Could not assess this cue.”'; error.classList.remove('is-hidden'); }
      document.querySelector<HTMLInputElement>('input[name="rating"]')?.focus(); return;
    }
    const step = STEPS[session.currentStep];
    session = upsertAnswer(session, { stepId: step.id, value, note: (document.querySelector<HTMLTextAreaElement>('#observation-note')?.value ?? '').trim(), assessedAt: new Date().toISOString() });
    player.stop();
    if (session.currentStep < STEPS.length - 1) { session.currentStep += 1; await persist(); render({ focus: true }); }
    else { await persist(); view = 'setup'; render({ focus: true }); }
  });

  document.querySelectorAll<HTMLInputElement>('input[type="range"]').forEach(input => input.addEventListener('input', () => {
    const output = document.querySelector<HTMLOutputElement>(input.name === 'systemVolume' ? '#system-output' : '#reader-output');
    if (output) output.value = `${input.value}%`;
  }));
  document.querySelector<HTMLFormElement>('#settings-form')?.addEventListener('submit', async event => {
    event.preventDefault(); if (!session) return;
    const data = new FormData(event.currentTarget as HTMLFormElement);
    const name = String(data.get('deviceName') ?? '').trim();
    if (!name) { const error = document.querySelector<HTMLElement>('#settings-error'); if (error) { error.textContent = 'Enter the headset name shown by your operating system.'; error.classList.remove('is-hidden'); } document.querySelector<HTMLInputElement>('input[name="deviceName"]')?.focus(); return; }
    session.settings = {
      platform: String(data.get('platform')), deviceName: name,
      systemVolume: Number(data.get('systemVolume')), screenReaderVolume: Number(data.get('screenReaderVolume')),
      monoAudio: String(data.get('monoAudio')) as SetupSettings['monoAudio'], spatialAudio: String(data.get('spatialAudio')) as SetupSettings['spatialAudio'],
      audioDucking: String(data.get('audioDucking')) as SetupSettings['audioDucking'], notificationStyle: String(data.get('notificationStyle')) as SetupSettings['notificationStyle'], notes: String(data.get('notes') ?? '').trim()
    };
    session.completedAt = new Date().toISOString(); session.updatedAt = session.completedAt; session.currentStep = STEPS.length - 1;
    await persist(); view = 'card'; render({ focus: true });
  });

  document.querySelectorAll<HTMLButtonElement>('.open-card').forEach(button => button.addEventListener('click', () => { session = sessions.find(item => item.id === button.dataset.id); if (session) { view = 'card'; render({ focus: true }); } }));
  document.querySelectorAll<HTMLButtonElement>('.remove-card').forEach(button => button.addEventListener('click', async () => {
    const found = sessions.find(item => item.id === button.dataset.id); if (!found) return;
    if (!confirm(`Remove the setup card for ${found.settings?.deviceName || 'this headset'} from this browser?`)) return;
    recentlyRemoved = found; await removeSession(found.id); await refreshSessions(); render();
  }));
  document.querySelector('#undo-remove')?.addEventListener('click', async () => { if (recentlyRemoved) { await saveSession(recentlyRemoved); await refreshSessions(); recentlyRemoved = undefined; render(); announce('Setup card restored.'); } });
  document.querySelector('#export-all')?.addEventListener('click', () => download('headset-cue-check-cards.json', { format: 'headset-cue-check', version: 1, exportedAt: new Date().toISOString(), sessions: sessions.filter(item => item.completedAt) }));
  document.querySelector<HTMLInputElement>('#import-file')?.addEventListener('change', async event => {
    const file = (event.currentTarget as HTMLInputElement).files?.[0]; if (!file) return;
    try {
      const parsed = JSON.parse(await file.text()) as { format?: unknown; version?: unknown; sessions?: unknown };
      if (parsed.format !== 'headset-cue-check' || parsed.version !== 1 || !isValidImport(parsed.sessions)) throw new Error('This file is not a valid Headset Cue Check export. Choose a JSON file exported by this app.');
      storageError = '';
      const count = await mergeSessions(parsed.sessions); await refreshSessions(); render(); announce(`${count} setup ${count === 1 ? 'card' : 'cards'} imported.`);
    } catch (error) { storageError = error instanceof Error ? error.message : 'The selected file could not be imported.'; render(); }
  });
  document.querySelector('#copy-card')?.addEventListener('click', async () => { if (!session) return; try { await navigator.clipboard.writeText(cardSummary(session)); announce('Setup card copied.'); } catch { announce('Copy was blocked. Use Print card instead.'); } });
  document.querySelector('#print-card')?.addEventListener('click', () => window.print());
  document.querySelector('#export-card')?.addEventListener('click', () => { if (session) download(`headset-cue-check-${session.settings?.deviceName.toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'card'}.json`, { format: 'headset-cue-check', version: 1, exportedAt: new Date().toISOString(), sessions: [session] }); });
  document.querySelector('#home-button')?.addEventListener('click', () => { session = undefined; view = 'home'; history.pushState({}, '', '/'); render({ focus: true }); });
  document.querySelector('#reload-app')?.addEventListener('click', () => location.reload());
  document.querySelector('#reset-demo')?.addEventListener('click', async () => {
    await clearSessions();
    await saveSession(demoSession());
    session = undefined;
    view = 'home';
    storageError = '';
    recentlyRemoved = undefined;
    await refreshSessions();
    render({ focus: true });
    announce('Demo reset to the original sample card.');
  });
}

window.addEventListener('popstate', () => { view = 'home'; render({ focus: true }); });
window.addEventListener('online', () => { document.querySelector('#connection')?.classList.add('is-hidden'); announce('Back online.'); });
window.addEventListener('offline', () => { document.querySelector('#connection')?.classList.remove('is-hidden'); announce('Offline. The guide and saved cards still work.'); });
document.addEventListener('keydown', event => {
  if (view !== 'check' || !session) return;
  const target = event.target as HTMLElement;
  if (['INPUT', 'TEXTAREA', 'SELECT', 'BUTTON'].includes(target.tagName)) return;
  if (event.code === 'Space') { event.preventDefault(); document.querySelector<HTMLButtonElement>('#play-cue')?.click(); }
  if (event.key === 'ArrowLeft' && session.currentStep > 0) { session.currentStep -= 1; render({ focus: true }); }
  if (event.key === 'ArrowRight' && session.currentStep < STEPS.length - 1 && session.answers.some(answer => answer.stepId === STEPS[session!.currentStep].id)) { session.currentStep += 1; render({ focus: true }); }
});

async function registerServiceWorker(): Promise<void> {
  if (!('serviceWorker' in navigator) || import.meta.env.DEV) return;
  try {
    const registration = await navigator.serviceWorker.register('/sw.js');
    registration.addEventListener('updatefound', () => {
      const worker = registration.installing;
      worker?.addEventListener('statechange', () => {
        if (worker.state === 'installed' && navigator.serviceWorker.controller) document.querySelector('#update-toast')?.classList.remove('is-hidden');
      });
    });
  } catch { announce('Offline installation is unavailable in this browser. The online guide still works.'); }
}

async function init(): Promise<void> {
  useDemoStorage(demoMode);
  try {
    await refreshSessions();
    if (demoMode && sessions.length === 0) { await saveSession(demoSession()); await refreshSessions(); }
  } catch (error) { storageError = error instanceof Error ? error.message : 'Local storage is unavailable.'; }
  const startNow = new URLSearchParams(location.search).get('start') === '1';
  if (startNow && location.pathname === '/') { session = createSession(); view = 'check'; await persist(); }
  render();
  await registerServiceWorker();
}

void init();
