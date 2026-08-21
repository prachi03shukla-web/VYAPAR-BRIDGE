import fs from 'fs';
let content = fs.readFileSync('src/App.tsx', 'utf8');

const target = `                          <button
                            type="button"
                            onClick={fetchUsersAndReports}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow transition-all cursor-pointer inline-flex items-center gap-1.5"
                          >
                            <RefreshCw className="w-3.5 h-3.5" /> Refresh List
                          </button>`;

content = content.replace(target, '');
fs.writeFileSync('src/App.tsx', content);
