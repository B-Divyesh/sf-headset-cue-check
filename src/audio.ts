export type CueId = 'speech' | 'channels' | 'mono' | 'level' | 'interruption' | 'notification';
export type NotificationStyle = 'gentle' | 'balanced' | 'distinct';

export class CuePlayer {
  private context?: AudioContext;
  private source?: AudioBufferSourceNode;
  private timers: number[] = [];
  private buffers = new Map<string, AudioBuffer>();
  private style: NotificationStyle = 'balanced';
  onState?: (message: string, playing: boolean) => void;

  setNotificationStyle(style: NotificationStyle) { this.style = style; }

  async play(id: CueId): Promise<void> {
    this.stop();
    const ctx = this.context ?? new AudioContext();
    this.context = ctx;
    if (ctx.state === 'suspended') await ctx.resume();
    this.onState?.(`Playing ${id} cue.`, true);
    try {
      if (id === 'speech') await this.playFile('/audio/field-sentence.wav', 0.72, 0);
      if (id === 'channels') await this.sequence([
        () => this.playFile('/audio/left-channel.wav', 0.75, -1),
        () => this.playFile('/audio/right-channel.wav', 0.75, 1)
      ], 500);
      if (id === 'mono') await this.toneSequence([-1, 1, 0], [440, 540, 490]);
      if (id === 'level') await this.sequence([
        () => this.playFile('/audio/field-sentence.wav', 0.32, 0),
        () => this.playFile('/audio/field-sentence.wav', 0.72, 0)
      ], 650);
      if (id === 'interruption') await this.playInterruption();
      if (id === 'notification') await this.playNotification(this.style);
      this.onState?.(`${id[0].toUpperCase()}${id.slice(1)} cue finished.`, false);
    } catch (error) {
      this.onState?.('Audio could not play. Check site audio permission and your selected output device, then try again.', false);
      throw error;
    }
  }

  stop(): void {
    this.source?.stop();
    this.source = undefined;
    this.timers.forEach(window.clearTimeout);
    this.timers = [];
  }

  private async buffer(path: string): Promise<AudioBuffer> {
    const cached = this.buffers.get(path);
    if (cached) return cached;
    const response = await fetch(path);
    if (!response.ok) throw new Error('Audio file unavailable');
    const decoded = await this.context!.decodeAudioData(await response.arrayBuffer());
    this.buffers.set(path, decoded);
    return decoded;
  }

  private async playFile(path: string, volume: number, pan: number): Promise<void> {
    const source = this.context!.createBufferSource();
    const gain = this.context!.createGain();
    const panner = this.context!.createStereoPanner();
    source.buffer = await this.buffer(path);
    gain.gain.value = volume;
    panner.pan.value = pan;
    source.connect(gain).connect(panner).connect(this.context!.destination);
    this.source = source;
    return new Promise((resolve, reject) => {
      source.onended = () => { if (this.source === source) this.source = undefined; resolve(); };
      try { source.start(); } catch (error) { reject(error); }
    });
  }

  private async sequence(items: (() => Promise<void>)[], gap: number): Promise<void> {
    for (const play of items) {
      await play();
      await new Promise<void>(resolve => { const timer = window.setTimeout(resolve, gap); this.timers.push(timer); });
    }
  }

  private async toneSequence(pans: number[], frequencies: number[]): Promise<void> {
    for (let index = 0; index < pans.length; index += 1) {
      await this.tone(frequencies[index], pans[index], 0.42, 0.18);
      await new Promise<void>(resolve => { const timer = window.setTimeout(resolve, 260); this.timers.push(timer); });
    }
  }

  private tone(frequency: number, pan: number, seconds: number, volume: number): Promise<void> {
    const ctx = this.context!;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const panner = ctx.createStereoPanner();
    osc.type = 'sine'; osc.frequency.value = frequency; panner.pan.value = pan;
    gain.gain.setValueAtTime(0.0001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(volume, ctx.currentTime + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + seconds);
    osc.connect(gain).connect(panner).connect(ctx.destination);
    osc.start(); osc.stop(ctx.currentTime + seconds + 0.03);
    return new Promise(resolve => { osc.onended = () => resolve(); });
  }

  private async playNotification(style: NotificationStyle): Promise<void> {
    const notes = style === 'gentle' ? [392] : style === 'distinct' ? [659, 784, 988] : [523, 659];
    const volume = style === 'gentle' ? 0.1 : style === 'distinct' ? 0.2 : 0.15;
    for (const note of notes) { await this.tone(note, 0, 0.16, volume); }
  }

  private async playInterruption(): Promise<void> {
    const speech = this.playFile('/audio/interruption-sentence.wav', 0.62, 0);
    const timer = window.setTimeout(() => { void this.playNotification('balanced'); }, 1250);
    this.timers.push(timer);
    await speech;
  }
}
