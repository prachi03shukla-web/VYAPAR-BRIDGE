import fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf8');

const target = `            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setUserToDelete(null)}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-700 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteUser}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-black text-xs font-extrabold transition-colors shadow-lg cursor-pointer flex items-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" /> Yes, Delete User
              </button>
            </div>`;

const replacement = `            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={confirmDeleteUser}
                className="px-5 py-2.5 w-full rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-extrabold transition-colors shadow-lg cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" /> Permanently Delete User
              </button>
            </div>`;

content = content.replace(target, replacement);

fs.writeFileSync('src/App.tsx', content);
