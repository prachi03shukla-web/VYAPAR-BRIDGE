import React, { useState } from 'react';
import { ALL_INDUSTRIES, IndustryHub, SubCategory } from '../constants/industryData';
import { Building2, Store, MapPin, Sparkles, Filter, Navigation, Globe, ShieldCheck, ChevronRight, CheckCircle2, Search, X, UserCheck, MessageCircle, Phone } from 'lucide-react';
import { clsx } from 'clsx';
import { calculateDistance } from '../App';
import { ConnectUserModal } from './ConnectUserModal';

interface IndustryCommerceHubProps {
  selectedIndustryId: string;
  onSelectIndustry: (id: string) => void;
  selectedSubcategoryId: string;
  onSelectSubcategory: (subId: string) => void;
  filterRadius: 'all' | '100km';
  onChangeFilterRadius: (radius: 'all' | '100km') => void;
  filterRole: 'all' | 'factory' | 'dealer';
  onChangeFilterRole: (role: 'all' | 'factory' | 'dealer') => void;
  userLocation?: { lat: number; lng: number } | null;
  dealersList?: any[];
  onOpenDirectory?: () => void;
  onOpenVerifyModal?: () => void;
}

export function IndustryCommerceHub({
  selectedIndustryId,
  onSelectIndustry,
  selectedSubcategoryId,
  onSelectSubcategory,
  filterRadius,
  onChangeFilterRadius,
  filterRole,
  onChangeFilterRole,
  userLocation,
  dealersList = [],
  onOpenDirectory,
  onOpenVerifyModal
}: IndustryCommerceHubProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedConnectUser, setSelectedConnectUser] = useState<any | null>(null);
  const activeIndustry = ALL_INDUSTRIES.find(i => i.id === selectedIndustryId);

  // Live search filtering across dealers/suppliers/merchants and industries/categories
  const cleanQ = searchQuery.trim().toLowerCase();

  const matchedDealers = cleanQ ? dealersList.filter(d => {
    const name = (d.name || '').toLowerCase();
    const company = (d.companyName || '').toLowerCase();
    const cat = (d.category || '').toLowerCase();
    const city = (d.city || '').toLowerCase();
    const state = (d.state || '').toLowerCase();
    const gst = (d.gstNumber || '').toLowerCase();
    const role = (d.role || '').toLowerCase();
    const bio = (d.bio || '').toLowerCase();

    return name.includes(cleanQ) || company.includes(cleanQ) || cat.includes(cleanQ) || city.includes(cleanQ) || state.includes(cleanQ) || gst.includes(cleanQ) || role.includes(cleanQ) || bio.includes(cleanQ);
  }) : [];

  const matchedIndustries = cleanQ ? ALL_INDUSTRIES.filter(ind => {
    const indName = ind.name.toLowerCase();
    const shortName = ind.shortName.toLowerCase();
    const subsMatch = ind.subcategories.some(s => s.name.toLowerCase().includes(cleanQ) || s.tags.some(t => t.toLowerCase().includes(cleanQ)));
    return indName.includes(cleanQ) || shortName.includes(cleanQ) || subsMatch;
  }) : [];

  return (
    <div className="w-full mb-6 space-y-3 relative">
      {/* Connect Modal Dialog */}
      {selectedConnectUser && (
        <ConnectUserModal 
          targetUser={selectedConnectUser}
          onClose={() => setSelectedConnectUser(null)}
        />
      )}

      {/* Top Banner: All India Commerce Hub Header */}
      <div className="bg-gradient-to-r from-amber-500/10 via-slate-900/40 to-blue-500/10 dark:from-amber-950/40 dark:via-zinc-900/60 dark:to-blue-950/40 border border-amber-500/30 dark:border-amber-500/20 rounded-2xl p-3.5 shadow-md">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-yellow-600 flex items-center justify-center text-lg shadow-md shrink-0">
              🇮🇳
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-sm text-black dark:text-zinc-50 uppercase tracking-wider">
                  All India Vyapar Hub
                </h3>
                <span className="bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/40 text-[9px] font-black uppercase px-2 py-0.5 rounded-full">
                  Multi-Industry B2B
                </span>
              </div>
              <p className="text-[11px] text-black/70 dark:text-zinc-400 font-medium">
                Search & Connect directly with Factories, Mills, Dealers & Suppliers
              </p>
            </div>
          </div>

          {/* 100 KM Plan vs All India Plan Filter Toggle */}
          <div className="flex items-center gap-1.5 bg-white/80 dark:bg-black/80 p-1 rounded-xl border border-slate-200 dark:border-zinc-800 self-stretch sm:self-auto justify-center">
            <button
              onClick={() => onChangeFilterRadius('100km')}
              className={clsx(
                "flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer",
                filterRadius === '100km'
                  ? "bg-amber-500 text-slate-950 font-black shadow-md"
                  : "text-black/70 dark:text-zinc-400 hover:text-black dark:hover:text-white"
              )}
              title="100km Radius Plan - Prioritizes nearby local dealers & factories"
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>Nearby (100 KM)</span>
              <span className="text-[9px] px-1 py-0.2 bg-slate-950/20 rounded font-black">₹99 Plan</span>
            </button>

            <button
              onClick={() => onChangeFilterRadius('all')}
              className={clsx(
                "flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer",
                filterRadius === 'all'
                  ? "bg-blue-600 text-white font-black shadow-md"
                  : "text-black/70 dark:text-zinc-400 hover:text-black dark:hover:text-white"
              )}
              title="All India VIP Plan - Nationwide verified factories and dealers"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>All India</span>
              <span className="text-[9px] px-1 py-0.2 bg-white/20 rounded font-black">VIP ₹1188</span>
            </button>
          </div>
        </div>

        {/* Live Search Bar inside Vyapar Hub */}
        <div className="mt-3 relative">
          <div className="relative flex items-center">
            <Search className="w-4 h-4 absolute left-3.5 text-amber-500 font-bold" />
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Dealer, Factory, Merchant, Item (e.g. Mukul, Tiles, FMCG, City)..."
              className="w-full bg-white dark:bg-zinc-950 border border-amber-500/40 focus:border-amber-500 rounded-xl pl-10 pr-9 py-2 text-xs font-medium text-black dark:text-zinc-100 placeholder:text-black/70 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500/30 shadow-inner"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 text-black/60 dark:text-zinc-400 hover:text-black text-xs font-bold p-1 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* LIVE SEARCH POPUP OVERLAY */}
          {cleanQ && (
            <div className="absolute left-0 right-0 top-full mt-2 z-50 bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-amber-500/40 p-4 max-h-[75vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-100 dark:border-zinc-800">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span className="font-black text-xs uppercase tracking-wider text-black dark:text-zinc-100">
                    Live Search Results ({matchedDealers.length + matchedIndustries.length})
                  </span>
                </div>
                <button 
                  onClick={() => setSearchQuery('')}
                  className="text-[11px] font-bold text-amber-600 dark:text-amber-400 hover:underline cursor-pointer"
                >
                  Close Results
                </button>
              </div>

              {/* 1. Matching Dealers & Merchants */}
              <div className="space-y-2 mb-4">
                <span className="text-[10px] font-black uppercase tracking-widest text-black/70 dark:text-zinc-400 block">
                  🏬 Suppliers, Dealers & Merchants ({matchedDealers.length})
                </span>
                {matchedDealers.length > 0 ? (
                  matchedDealers.map((d, idx) => (
                    <div 
                      key={d.id || `dealer-${idx}`}
                      onClick={() => setSelectedConnectUser(d)}
                      className="p-3 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl hover:border-amber-500 transition-all flex items-center justify-between gap-3 cursor-pointer group"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`w-10 h-10 rounded-full overflow-hidden shrink-0 ${d.isVerified ? 'tiranga-border-circle p-[2px]' : 'bg-slate-200 dark:bg-zinc-800'}`}>
                          <div className="w-full h-full bg-[#E6C76C] dark:bg-black rounded-full overflow-hidden flex items-center justify-center font-bold text-black dark:text-zinc-200 text-sm">
                            {d.avatarUrl || d.avatar ? (
                              <img src={d.avatarUrl || d.avatar} alt={d.name} className="w-full h-full object-cover" />
                            ) : (
                              d.name?.charAt(0) || 'B'
                            )}
                          </div>
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-bold text-xs text-black dark:text-zinc-100 group-hover:text-amber-500 transition-colors flex items-center gap-1 truncate">
                            <span>{d.companyName || d.name}</span>
                            {d.isVerified && <CheckCircle2 className="w-3.5 h-3.5 text-blue-500 shrink-0" />}
                          </h4>
                          <p className="text-[10px] text-black/60 dark:text-zinc-400 truncate">
                            {d.role === 'factory' ? '🏭 Factory / Mill' : '🏬 Dealer / Dist.'} {d.city ? `• ${d.city}, ${d.state || ''}` : ''}
                          </p>
                        </div>
                      </div>

                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedConnectUser(d);
                        }}
                        className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-[11px] rounded-lg shadow transition-transform active:scale-95 cursor-pointer shrink-0"
                      >
                        ⚡ Connect Now
                      </button>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-black/70 dark:text-zinc-400 italic py-1">
                    No specific dealer/supplier name matching "{searchQuery}"
                  </p>
                )}
              </div>

              {/* 2. Matching Categories & Industries */}
              <div className="space-y-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-black/70 dark:text-zinc-400 block">
                  🏷️ Categories & Sector Hubs ({matchedIndustries.length})
                </span>
                {matchedIndustries.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {matchedIndustries.map(ind => (
                      <button
                        key={ind.id}
                        onClick={() => {
                          onSelectIndustry(ind.id);
                          onSelectSubcategory('all');
                          setSearchQuery('');
                        }}
                        className="p-2.5 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl hover:border-amber-500 transition-all flex items-center gap-2 text-left cursor-pointer"
                      >
                        <span className="text-base">{ind.icon}</span>
                        <div>
                          <span className="font-bold text-xs text-black dark:text-zinc-100 block">
                            {ind.name}
                          </span>
                          <span className="text-[10px] text-black/60 dark:text-zinc-400 block">
                            Filter by {ind.shortName}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-black/70 dark:text-zinc-400 italic py-1">
                    No matching industry categories
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Primary Industry Tabs Bar */}
        <div className="mt-3.5 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
          <button
            onClick={() => {
              onSelectIndustry('all');
              onSelectSubcategory('all');
            }}
            className={clsx(
              "flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider shrink-0 transition-all border cursor-pointer",
              selectedIndustryId === 'all'
                ? "bg-slate-950 text-amber-400 border-amber-400 shadow-md scale-105"
                : "bg-white/90 dark:bg-zinc-900/90 text-black/80 dark:text-zinc-300 border-slate-200 dark:border-zinc-800 hover:border-amber-400"
            )}
          >
            <span>🌐</span>
            <span>All Industries</span>
          </button>

          {ALL_INDUSTRIES.map(industry => {
            const isSelected = selectedIndustryId === industry.id;
            return (
              <button
                key={industry.id}
                onClick={() => {
                  onSelectIndustry(industry.id);
                  onSelectSubcategory('all');
                }}
                className={clsx(
                  "flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider shrink-0 transition-all border cursor-pointer",
                  isSelected
                    ? "bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 border-amber-400 shadow-md font-black scale-105"
                    : "bg-white/90 dark:bg-zinc-900/90 text-black/80 dark:text-zinc-300 border-slate-200 dark:border-zinc-800 hover:border-amber-400"
                )}
              >
                <span className="text-sm">{industry.icon}</span>
                <span>{industry.shortName}</span>
                {isSelected && (
                  <span className="text-[10px] bg-slate-950/20 px-1.5 py-0.5 rounded-full font-black">
                    Active
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>


      {/* Subcategory Pills & Secondary Filter Toolbar */}
      {activeIndustry && (
        <div className="bg-white/60 dark:bg-zinc-900/60 p-3 rounded-xl border border-slate-200 dark:border-zinc-800 space-y-2.5">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-base">{activeIndustry.icon}</span>
              <div>
                <span className="text-xs font-black text-black dark:text-zinc-100 uppercase tracking-wider">
                  {activeIndustry.name}
                </span>
                <span className="hidden sm:inline-block text-[11px] text-black/60 dark:text-zinc-400 ml-2 font-medium">
                  {activeIndustry.hindiName}
                </span>
              </div>
            </div>

            {/* Role Filter Selector: Factory vs Dealer vs All */}
            <div className="flex items-center gap-1 text-[11px] font-bold">
              <button
                onClick={() => onChangeFilterRole('all')}
                className={clsx(
                  "px-2 py-1 rounded-lg border transition-all cursor-pointer",
                  filterRole === 'all'
                    ? "bg-slate-900 text-white dark:bg-zinc-100 dark:text-slate-950 font-black border-slate-900"
                    : "bg-transparent text-black/70 dark:text-zinc-400 border-slate-300 dark:border-zinc-700"
                )}
              >
                All Roles
              </button>
              <button
                onClick={() => onChangeFilterRole('factory')}
                className={clsx(
                  "flex items-center gap-1 px-2 py-1 rounded-lg border transition-all cursor-pointer",
                  filterRole === 'factory'
                    ? "bg-amber-500 text-slate-950 font-black border-amber-400"
                    : "bg-transparent text-black/70 dark:text-zinc-400 border-slate-300 dark:border-zinc-700"
                )}
              >
                <Building2 className="w-3 h-3" />
                <span>Factories</span>
              </button>
              <button
                onClick={() => onChangeFilterRole('dealer')}
                className={clsx(
                  "flex items-center gap-1 px-2 py-1 rounded-lg border transition-all cursor-pointer",
                  filterRole === 'dealer'
                    ? "bg-blue-600 text-white font-black border-blue-500"
                    : "bg-transparent text-black/70 dark:text-zinc-400 border-slate-300 dark:border-zinc-700"
                )}
              >
                <Store className="w-3 h-3" />
                <span>Dealers</span>
              </button>
            </div>
          </div>

          {/* Subcategories Horizontal Scroll */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
            <button
              onClick={() => onSelectSubcategory('all')}
              className={clsx(
                "px-3 py-1.5 rounded-lg text-[11px] font-black uppercase tracking-wider shrink-0 transition-all border cursor-pointer",
                selectedSubcategoryId === 'all'
                  ? "bg-amber-500 text-slate-950 border-amber-400 shadow-sm"
                  : "bg-slate-100 dark:bg-zinc-800 text-black/70 dark:text-zinc-300 border-slate-200 dark:border-zinc-700 hover:bg-slate-200"
              )}
            >
              All {activeIndustry.shortName}
            </button>

            {activeIndustry.subcategories.map(sub => {
              const isSubSelected = selectedSubcategoryId === sub.id;
              return (
                <button
                  key={sub.id}
                  onClick={() => onSelectSubcategory(sub.id)}
                  className={clsx(
                    "px-3 py-1.5 rounded-lg text-[11px] font-bold shrink-0 transition-all border cursor-pointer flex items-center gap-1.5",
                    isSubSelected
                      ? "bg-slate-950 text-amber-400 border-amber-400 shadow-sm font-black"
                      : "bg-white dark:bg-zinc-800 text-black/80 dark:text-zinc-300 border-slate-200 dark:border-zinc-700 hover:border-amber-400"
                  )}
                  title={sub.description}
                >
                  <span>{sub.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Network Reach Indicator Bar */}
      <div className="flex items-center justify-between text-[11px] font-semibold text-black/70 dark:text-zinc-400 px-1">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>
            Showing {filterRadius === '100km' ? 'Nearby 100 KM local providers' : 'All-India verified network'}:
          </span>
          <span className="font-extrabold text-black dark:text-zinc-100">
            {activeIndustry ? activeIndustry.name : 'All Indian Commerce Sectors'}
          </span>
        </div>

        {filterRadius === '100km' && userLocation && (
          <span className="text-[10px] bg-amber-500/20 text-amber-800 dark:text-amber-300 px-2 py-0.5 rounded font-bold">
            📍 GPS Radius Filter Active
          </span>
        )}
      </div>
    </div>
  );
}
