/**
 * High-quality audio effects synthesizer using native Web Audio API.
 * Synthesizes a pleasant double-bubble pop notification sound when a post/reel publishes in background.
 */
export function playBubblePopSound(): void {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();

    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    const now = ctx.currentTime;

    // Pop 1
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(450, now);
    osc1.frequency.exponentialRampToValueAtTime(950, now + 0.08);

    gain1.gain.setValueAtTime(0.4, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

    osc1.connect(gain1);
    gain1.connect(ctx.destination);

    osc1.start(now);
    osc1.stop(now + 0.08);

    // Pop 2 (slightly higher pitch, 0.09s later for double bubble pop)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(650, now + 0.09);
    osc2.frequency.exponentialRampToValueAtTime(1350, now + 0.17);

    gain2.gain.setValueAtTime(0.5, now + 0.09);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.17);

    osc2.connect(gain2);
    gain2.connect(ctx.destination);

    osc2.start(now + 0.09);
    osc2.stop(now + 0.17);
  } catch (e) {
    console.warn('Audio bubble pop note:', e);
  }
}
