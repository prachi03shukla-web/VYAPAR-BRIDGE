import fs from 'fs';
let content = fs.readFileSync('src/App.tsx', 'utf8');

const target = `                        <button
                          type="button"
                          onClick={fetchUsersAndReports}
                          disabled={isFetchingUsers}
                          className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all cursor-pointer flex items-center justify-center gap-1.5 shrink-0"
                        >
                          <RefreshCw className={cn("w-3.5 h-3.5", isFetchingUsers && "animate-spin")} />
                          {isFetchingUsers ? 'Syncing...' : 'Sync Firestore'}
                        </button>`;

content = content.replace(target, '');
fs.writeFileSync('src/App.tsx', content);
