import fs from 'fs';

let lines = fs.readFileSync('src/App.tsx', 'utf8').split('\n');

for (let i = 13950; i < 14050; i++) {
  if (lines[i] && lines[i].includes('Delete My ID / Account Button right below Log Out')) {
    // We are close to the end of the menu
  }
}
