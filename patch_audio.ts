import fs from 'fs';

const content = `
const getSoundSettings = () => {
  try {
    const raw = localStorage.getItem('vyapar_sound_settings');
    if (raw) return JSON.parse(raw);
  } catch(e) {}
  return { likes: true, comments: true, shares: true, saves: true, enquiries: true, messages: true };
};

export const updateSoundSettings = (settings) => {
  localStorage.setItem('vyapar_sound_settings', JSON.stringify(settings));
};

export const getSoundSettingsSync = getSoundSettings;

function playOscillator(ctx, type, startFreq, endFreq, startTime, duration, vol) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(startFreq, startTime);
  osc.frequency.exponentialRampToValueAtTime(endFreq, startTime + duration);
  gain.gain.setValueAtTime(vol, startTime);
  gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(startTime);
  osc.stop(startTime + duration);
}

const getContext = () => {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return null;
    const ctx = new AudioContextClass();
    if (ctx.state === 'suspended') ctx.resume().catch(() => {});
    return ctx;
  } catch(e) { return null; }
};

export function playBubblePopSound(): void {
  const settings = getSoundSettings();
  if (!settings.comments) return;
  const ctx = getContext();
  if (!ctx) return;
  const now = ctx.currentTime;
  playOscillator(ctx, 'sine', 450, 950, now, 0.08, 0.4);
  playOscillator(ctx, 'sine', 650, 1350, now + 0.09, 0.08, 0.5);
}

export function playLikeSound(): void {
  const settings = getSoundSettings();
  if (!settings.likes) return;
  const ctx = getContext();
  if (!ctx) return;
  const now = ctx.currentTime;
  playOscillator(ctx, 'sine', 300, 600, now, 0.1, 0.5);
}

export function playSaveSound(): void {
  const settings = getSoundSettings();
  if (!settings.saves) return;
  const ctx = getContext();
  if (!ctx) return;
  const now = ctx.currentTime;
  playOscillator(ctx, 'sine', 400, 800, now, 0.1, 0.4);
  playOscillator(ctx, 'sine', 800, 1200, now + 0.1, 0.1, 0.4);
}

export function playShareSound(): void {
  const settings = getSoundSettings();
  if (!settings.shares) return;
  const ctx = getContext();
  if (!ctx) return;
  const now = ctx.currentTime;
  playOscillator(ctx, 'sine', 800, 300, now, 0.15, 0.4);
}

export function playEnquirySound(): void {
  const settings = getSoundSettings();
  if (!settings.enquiries) return;
  const ctx = getContext();
  if (!ctx) return;
  const now = ctx.currentTime;
  playOscillator(ctx, 'triangle', 400, 600, now, 0.05, 0.3);
  playOscillator(ctx, 'triangle', 500, 700, now + 0.08, 0.05, 0.3);
  playOscillator(ctx, 'triangle', 600, 800, now + 0.16, 0.05, 0.3);
}

export function playMessageSound(): void {
  const settings = getSoundSettings();
  if (!settings.messages) return;
  const ctx = getContext();
  if (!ctx) return;
  const now = ctx.currentTime;
  playOscillator(ctx, 'sine', 600, 900, now, 0.1, 0.6);
  playOscillator(ctx, 'sine', 900, 1200, now + 0.15, 0.2, 0.6);
}
`;

fs.writeFileSync('src/utils/audioEffects.ts', content);
