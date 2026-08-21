import fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replace(
  /import \{ playBubblePopSound \} from '\.\/utils\/audioEffects';/,
  "import { playBubblePopSound, playLikeSound, playSaveSound, playShareSound, playEnquirySound, playMessageSound, getSoundSettingsSync, updateSoundSettings } from './utils/audioEffects';"
);

fs.writeFileSync('src/App.tsx', content);
