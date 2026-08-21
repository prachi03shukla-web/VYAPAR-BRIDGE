import fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replace(
`        {/* Right Actions */}
        <div className="flex items-center gap-2 shrink-0 z-10 relative">
          <Link to="/notifications" title="Notifications" className="p-1 relative flex items-center justify-center">
            <Heart className="w-5.5 h-5.5 text-black dark:text-zinc-50 hover:scale-105 transition-transform" />
            {unreadNotifs > 0 && <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-black"></span>}
          </Link>
          <button 
            onClick={() => setIsSettingsDrawerOpen(true)}`,
`        {/* Right Actions */}
        <div className="flex items-center gap-2 shrink-0 z-10 relative">
          <Link to="/chat" title="Messages" className="p-1 relative flex items-center justify-center">
            <MessageCircle className="w-5 h-5 text-black dark:text-zinc-50 hover:scale-105 transition-transform" />
            {/* You could add unread message count here if available */}
          </Link>
          <Link to="/notifications" title="Notifications" className="p-1 relative flex items-center justify-center">
            <Heart className="w-5.5 h-5.5 text-black dark:text-zinc-50 hover:scale-105 transition-transform" />
            {unreadNotifs > 0 && <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-black"></span>}
          </Link>
          <button 
            onClick={() => setIsSettingsDrawerOpen(true)}`
);

fs.writeFileSync('src/App.tsx', content);
