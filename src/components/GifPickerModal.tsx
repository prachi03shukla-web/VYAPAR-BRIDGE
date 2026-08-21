import React, { useState } from 'react';
import { X, Search, Sparkles, Image as ImageIcon, Flame, ThumbsUp, Heart, CheckCircle2 } from 'lucide-react';

interface GifPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectGif: (gifUrl: string) => void;
}

// Curated high-performance lightweight animated GIF stickers tailored for business, trade, and chat
const POPULAR_GIFS = [
  { id: '1', title: 'Deal Done / Handshake', category: 'deal', url: 'https://media.giphy.com/media/l0MYt5jPR6QX5pnqM/giphy.gif' },
  { id: '2', title: 'Thumbs Up / Approved', category: 'reaction', url: 'https://media.giphy.com/media/111ebonMs90YLu/giphy.gif' },
  { id: '3', title: 'Congratulations / Celebration', category: 'reaction', url: 'https://media.giphy.com/media/artj92V8o75VPL7AeQ/giphy.gif' },
  { id: '4', title: 'Namaste / Welcome', category: 'greeting', url: 'https://media.giphy.com/media/l4pTfx2qLszoacZRS/giphy.gif' },
  { id: '5', title: 'Superb / Fire', category: 'reaction', url: 'https://media.giphy.com/media/26tOZ42Mg6pbTUPHW/giphy.gif' },
  { id: '6', title: '100% Quality Verified', category: 'deal', url: 'https://media.giphy.com/media/3o7abKhOpu0NwenH3O/giphy.gif' },
  { id: '7', title: 'Thank You', category: 'greeting', url: 'https://media.giphy.com/media/3oz8xIsloV7zOmt81G/giphy.gif' },
  { id: '8', title: 'Fast Delivery / Dispatch', category: 'deal', url: 'https://media.giphy.com/media/3o7TKTDnUxE0gpnk0o/giphy.gif' },
  { id: '9', title: 'Let\'s Connect / Call Me', category: 'deal', url: 'https://media.giphy.com/media/l3q2K5jinAlChoCLS/giphy.gif' },
  { id: '10', title: 'Awesome / Great Work', category: 'reaction', url: 'https://media.giphy.com/media/NEvPzZ8bd1V4Y/giphy.gif' },
  { id: '11', title: 'Mind Blown / Best Price', category: 'reaction', url: 'https://media.giphy.com/media/26ufdipQqU2lhNA4g/giphy.gif' },
  { id: '12', title: 'Clap / Applause', category: 'reaction', url: 'https://media.giphy.com/media/ytTYwIlbD1FBu/giphy.gif' },
  { id: '13', title: 'Love It', category: 'reaction', url: 'https://media.giphy.com/media/26BRv0ThflsHCqDrG/giphy.gif' },
  { id: '14', title: 'Check This Out', category: 'deal', url: 'https://media.giphy.com/media/l0HlvtIPzPdt2usKs/giphy.gif' },
  { id: '15', title: 'Perfect Match', category: 'deal', url: 'https://media.giphy.com/media/xT0xezQGU5xCDJuCPe/giphy.gif' },
  { id: '16', title: 'Money / High Profit', category: 'deal', url: 'https://media.giphy.com/media/67ThRZlYBvibtdF9JH/giphy.gif' },
];

const CATEGORIES = [
  { key: 'all', label: 'All GIFs', icon: Sparkles },
  { key: 'deal', label: 'Deals & Trade', icon: ThumbsUp },
  { key: 'reaction', label: 'Reactions', icon: Flame },
  { key: 'greeting', label: 'Greetings', icon: Heart },
];

export function GifPickerModal({ isOpen, onClose, onSelectGif }: GifPickerModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [customGifUrl, setCustomGifUrl] = useState('');

  if (!isOpen) return null;

  const filteredGifs = POPULAR_GIFS.filter((gif) => {
    const matchesCategory = selectedCategory === 'all' || gif.category === selectedCategory;
    const matchesSearch = !searchQuery || gif.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customGifUrl.trim()) {
      onSelectGif(customGifUrl.trim());
      setCustomGifUrl('');
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 z-[160] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 select-none animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div 
        className="relative max-w-lg w-full bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2">
            <span className="bg-gradient-to-r from-pink-500 to-rose-500 text-white font-black text-xs px-2 py-0.5 rounded-md tracking-wider">
              GIF
            </span>
            <h3 className="font-bold text-sm text-white">Choose an Animated GIF</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search & URL Input */}
        <div className="p-3 border-b border-slate-800 space-y-2 bg-slate-950/30">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search GIFs (e.g. Deal, Thanks, Congrats, Superb)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 text-white text-xs pl-9 pr-3 py-2 rounded-xl focus:outline-none focus:border-blue-500 placeholder-slate-400"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Categories */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              const isActive = selectedCategory === cat.key;
              return (
                <button
                  key={cat.key}
                  onClick={() => setSelectedCategory(cat.key)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 shrink-0 transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  <Icon className="w-3 h-3" />
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* GIF Grid */}
        <div className="flex-1 overflow-y-auto p-3 grid grid-cols-2 sm:grid-cols-3 gap-2.5 min-h-[250px] max-h-[360px] scrollbar-thin">
          {filteredGifs.map((gif) => (
            <div
              key={gif.id}
              onClick={() => {
                onSelectGif(gif.url);
                onClose();
              }}
              className="relative group rounded-xl overflow-hidden border border-slate-800 hover:border-blue-500 bg-slate-950 cursor-pointer aspect-video flex items-center justify-center transition-all hover:scale-[1.02] shadow-sm"
              title={gif.title}
            >
              <img
                src={gif.url}
                alt={gif.title}
                loading="lazy"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-1.5">
                <span className="text-[10px] font-bold text-white truncate">{gif.title}</span>
              </div>
            </div>
          ))}

          {filteredGifs.length === 0 && (
            <div className="col-span-full py-8 text-center text-xs text-slate-400">
              No matching GIFs found. You can paste any direct GIF link below!
            </div>
          )}
        </div>

        {/* Custom GIF Link paste bar */}
        <form onSubmit={handleCustomSubmit} className="p-3 border-t border-slate-800 bg-slate-950/70 flex gap-2">
          <input
            type="url"
            placeholder="Or paste any custom GIF link (https://...gif)"
            value={customGifUrl}
            onChange={(e) => setCustomGifUrl(e.target.value)}
            className="flex-1 bg-slate-800 border border-slate-700 text-white text-xs px-3 py-2 rounded-xl focus:outline-none focus:border-blue-500 placeholder-slate-400"
          />
          <button
            type="submit"
            disabled={!customGifUrl.trim()}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white text-xs font-bold px-3.5 py-2 rounded-xl cursor-pointer transition-colors"
          >
            Add GIF
          </button>
        </form>
      </div>
    </div>
  );
}
