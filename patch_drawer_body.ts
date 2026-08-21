import fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf8');

const soundView = `
        {activeView === 'sounds' ? (
          <div className="p-4 space-y-6">
            <p className="text-xs text-black/60 dark:text-zinc-400 mb-4">Toggle app sound effects for different interactions.</p>
            
            <div className="space-y-4">
              {[
                { key: 'likes', label: 'Like / Heart', icon: Heart, color: 'text-red-500' },
                { key: 'comments', label: 'Comment / App Pop', icon: MessageCircle, color: 'text-emerald-500' },
                { key: 'shares', label: 'Share', icon: Share2, color: 'text-blue-500' },
                { key: 'saves', label: 'Save / Bookmark', icon: Bookmark, color: 'text-amber-500' },
                { key: 'enquiries', label: 'Enquiry / Lead', icon: MessageSquare, color: 'text-emerald-600' },
                { key: 'messages', label: 'Direct Messages & Notifications', icon: Bell, color: 'text-indigo-500' },
              ].map(item => (
                <div key={item.key} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800">
                  <div className="flex items-center gap-3">
                    <item.icon className={"w-5 h-5 " + item.color} />
                    <span className="font-semibold text-sm">{item.label}</span>
                  </div>
                  <button 
                    onClick={() => toggleSound(item.key as any)}
                    className={"w-11 h-6 rounded-full transition-colors relative cursor-pointer " + (soundSettings[item.key as keyof typeof soundSettings] ? "bg-emerald-500" : "bg-slate-300 dark:bg-zinc-700")}
                  >
                    <div className={"w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform " + (soundSettings[item.key as keyof typeof soundSettings] ? "translate-x-5" : "translate-x-0.5")} />
                  </button>
                </div>
              ))}
            </div>
            
            <button 
              onClick={() => { playEnquirySound(); playMessageSound(); }}
              className="mt-6 w-full p-3 bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 rounded-xl font-bold text-sm hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
            >
              Test Sounds
            </button>
          </div>
        ) : (
`;

content = content.replace(
  `        {/* User / Guest Mini Profile Banner */}`,
  soundView + `        {/* User / Guest Mini Profile Banner */}`
);

// Close the activeView ternary block at the very end of the drawer content
content = content.replace(
  `      </div>\n    </div>\n    </>`,
  `        )}\n      </div>\n    </div>\n    </>`
);

// Add the button for Sound Settings
content = content.replace(
`          {/* Vyapar Calculator */}
          <button 
            onClick={() => { onClose(); onOpenCalculator(); }}`,
`          {/* Sound Settings */}
          <button 
            onClick={() => setActiveView('sounds')}
            className="w-full p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-zinc-900 flex items-center gap-3 transition-colors text-left font-semibold text-sm cursor-pointer group"
          >
            <div className="p-2 rounded-lg bg-pink-50 dark:bg-pink-950 text-pink-600 dark:text-pink-400 group-hover:scale-110 transition-transform">
              <Volume2 className="w-4 h-4" />
            </div>
            <div className="flex-1">
              <div className="text-black dark:text-zinc-100">Sound & Notifications</div>
              <div className="text-[11px] font-normal text-black/70 dark:text-zinc-400">Manage UI interaction sounds and alerts</div>
            </div>
          </button>

          {/* Vyapar Calculator */}
          <button 
            onClick={() => { onClose(); onOpenCalculator(); }}`
);

fs.writeFileSync('src/App.tsx', content);
