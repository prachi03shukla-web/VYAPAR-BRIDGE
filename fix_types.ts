import fs from 'fs';

let content = fs.readFileSync('src/utils/audioEffects.ts', 'utf8');

content = content.replace(
  'export const updateSoundSettings = (settings) => {',
  'export const updateSoundSettings = (settings: any) => {'
);
content = content.replace(
  'function playOscillator(ctx, type, startFreq, endFreq, startTime, duration, vol) {',
  'function playOscillator(ctx: any, type: OscillatorType, startFreq: number, endFreq: number, startTime: number, duration: number, vol: number) {'
);

fs.writeFileSync('src/utils/audioEffects.ts', content);
