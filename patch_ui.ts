import fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Remove "Sync Firestore" button from AdminPanel (first one)
content = content.replace(
  `                        <div className="w-full relative max-w-sm flex-1">
                          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                          <input
                            type="text"
                            value={userSearchQuery}
                            onChange={e => setUserSearchQuery(e.target.value)}
                            placeholder="Search members by name, username, phone, city, GST..."
                            className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={fetchUsersAndReports}
                          disabled={isFetchingUsers}
                          className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all cursor-pointer flex items-center justify-center gap-1.5 shrink-0"
                        >
                          <RefreshCw className={cn("w-3.5 h-3.5", isFetchingUsers && "animate-spin")} />
                          {isFetchingUsers ? 'Syncing...' : 'Sync Firestore'}
                        </button>`,
  `                        <div className="w-full relative max-w-sm flex-1">
                          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                          <input
                            type="text"
                            value={userSearchQuery}
                            onChange={e => setUserSearchQuery(e.target.value)}
                            placeholder="Search members by name, username, phone, city, GST..."
                            className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>`
);

// Remove "Sync Firestore" button from MasterDeveloperConsoleModal
content = content.replace(
  `                      <div className="w-full relative max-w-md flex-1">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-zinc-500" />
                        <input
                          type="text"
                          value={userSearchQuery}
                          onChange={e => setUserSearchQuery(e.target.value)}
                          placeholder="Search users, factory names, phones, city..."
                          className="w-full pl-9 pr-3 py-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-zinc-100"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={fetchUsersAndReports}
                        disabled={isFetchingUsers}
                        className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all cursor-pointer flex items-center justify-center gap-1.5 shrink-0"
                      >
                        <RefreshCw className={cn("w-3.5 h-3.5", isFetchingUsers && "animate-spin")} />
                        {isFetchingUsers ? 'Syncing...' : 'Sync Firestore'}
                      </button>`,
  `                      <div className="w-full relative max-w-md flex-1">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-zinc-500" />
                        <input
                          type="text"
                          value={userSearchQuery}
                          onChange={e => setUserSearchQuery(e.target.value)}
                          placeholder="Search users, factory names, phones, city..."
                          className="w-full pl-9 pr-3 py-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-zinc-100"
                        />
                      </div>`
);

// Modify Delete User Modal - AdminPanel (userToDelete)
content = content.replace(
  `            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setUserToDelete(null)}
                disabled={isDeletingUser}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeleteUser}
                disabled={isDeletingUser}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-extrabold transition-colors shadow-lg cursor-pointer flex items-center gap-1.5"
              >
                {isDeletingUser ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" /> Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" /> Yes, Delete User
                  </>
                )}
              </button>
            </div>`,
  `            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={confirmDeleteUser}
                disabled={isDeletingUser}
                className="px-5 py-2.5 w-full rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-extrabold transition-colors shadow-lg cursor-pointer flex items-center justify-center gap-1.5"
              >
                {isDeletingUser ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" /> Force Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" /> Permanently Delete User
                  </>
                )}
              </button>
            </div>`
);

// Modify Delete User Modal - MasterConsole (userToDelete)
content = content.replace(
  `            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setUserToDelete(null)}
                disabled={isDeletingUser}
                className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 text-xs font-bold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteUser}
                disabled={isDeletingUser}
                className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-extrabold transition-colors shadow-lg cursor-pointer flex items-center gap-1.5"
              >
                {isDeletingUser ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" /> Yes, Delete Profile
                  </>
                )}
              </button>
            </div>`,
  `            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={handleConfirmDeleteUser}
                disabled={isDeletingUser}
                className="px-5 py-2.5 w-full rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-extrabold transition-colors shadow-lg cursor-pointer flex items-center justify-center gap-1.5"
              >
                {isDeletingUser ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Force Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" /> Permanently Delete Profile
                  </>
                )}
              </button>
            </div>`
);

// Modify Reset Database Modal (isResetConfirmOpen)
content = content.replace(
  `            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsResetConfirmOpen(false)}
                disabled={isResettingDb}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleResetAllData}
                disabled={isResettingDb}
                className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-extrabold transition-colors shadow-lg cursor-pointer flex items-center gap-1.5"
              >
                {isResettingDb ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" /> Resetting...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" /> Yes, Purge & Reset Database
                  </>
                )}
              </button>
            </div>`,
  `            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={handleResetAllData}
                disabled={isResettingDb}
                className="px-5 py-2.5 w-full rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-extrabold transition-colors shadow-lg cursor-pointer flex items-center justify-center gap-1.5"
              >
                {isResettingDb ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" /> Resetting & Purging...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" /> Force Reset & Purge Database
                  </>
                )}
              </button>
            </div>`
);

fs.writeFileSync('src/App.tsx', content);
