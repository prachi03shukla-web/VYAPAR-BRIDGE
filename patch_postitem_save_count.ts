import fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replace(
`          <button onClick={handleSave} className="text-black dark:text-zinc-100 hover:text-black/70 dark:hover:text-zinc-300 transition-colors duration-700">
            <Bookmark className={cn("w-6 h-6 transition-all duration-700 active:scale-95", isSaved ? "text-black dark:text-zinc-50 fill-slate-900 dark:fill-white" : "")} />
          </button>`,
`          <button onClick={handleSave} className="flex items-center gap-1.5 text-black dark:text-zinc-100 hover:text-black/70 dark:hover:text-zinc-300 transition-colors duration-700">
            <Bookmark className={cn("w-6 h-6 transition-all duration-700 active:scale-95", isSaved ? "text-black dark:text-zinc-50 fill-slate-900 dark:fill-white" : "")} />
            {savedCount > 0 && <span className="font-semibold">{savedCount}</span>}
          </button>`
);

fs.writeFileSync('src/App.tsx', content);
