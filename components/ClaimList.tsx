'use client';

import React, { useState } from 'react';
import { Claim, Role } from '@/lib/types';
import { 
  AlertTriangle, 
  CheckCircle2, 
  ChevronRight, 
  Clock, 
  ShieldAlert, 
  ShieldCheck,
  Search,
  Filter,
  Image as ImageIcon,
  Video,
  Scale,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';

interface ClaimListProps {
  claims: Claim[];
  onSelect: (claim: Claim) => void;
  role: Role;
  onAnalyzeFault?: (claims: Claim[]) => void;
  isAnalyzingFault?: string | null;
}

type SortOption = 'recent' | 'oldest' | 'suspicious' | 'clean';

export function ClaimList({ claims, onSelect, role, onAnalyzeFault, isAnalyzingFault }: ClaimListProps) {
  const [sortBy, setSortBy] = useState<SortOption>('recent');
  const [search, setSearch] = useState('');

  const isOfficer = role === 'officer';

  const sortedClaims = [...claims]
    .filter(c => 
      c.claimNumber.toLowerCase().includes(search.toLowerCase()) ||
      c.description.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'recent') return b.timestamp - a.timestamp;
      if (sortBy === 'oldest') return a.timestamp - b.timestamp;
      if (sortBy === 'suspicious') return b.verdictScore - a.verdictScore;
      if (sortBy === 'clean') return a.verdictScore - b.verdictScore;
      return 0;
    });

  // Group by claim number
  const groupedClaims: Record<string, Claim[]> = {};
  sortedClaims.forEach(c => {
    if (!groupedClaims[c.claimNumber]) groupedClaims[c.claimNumber] = [];
    groupedClaims[c.claimNumber].push(c);
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search claims..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-100 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
          />
        </div>
        
        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-2 text-sm font-medium text-slate-700 outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="recent">Most Recent</option>
            <option value="oldest">Oldest</option>
            {isOfficer && <option value="suspicious">Most Suspicious</option>}
            {isOfficer && <option value="clean">Cleanest</option>}
          </select>
        </div>
      </div>

      <div className="grid gap-4">
        <AnimatePresence mode="popLayout">
          {Object.entries(groupedClaims).map(([claimNumber, group]) => (
            <motion.div
              key={claimNumber}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
            >
              <div className="bg-slate-50 px-6 py-3 border-bottom border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Claim Group: {claimNumber}</span>
                  <span className="text-xs text-slate-400">{group.length} {group.length === 1 ? 'entry' : 'entries'}</span>
                </div>
                {isOfficer && group.length > 1 && (
                  <button
                    onClick={() => onAnalyzeFault?.(group)}
                    disabled={isAnalyzingFault === claimNumber}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 disabled:opacity-50 transition-all active:scale-95"
                  >
                    {isAnalyzingFault === claimNumber ? (
                      <>
                        <Loader2 className="w-3 h-3 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Scale className="w-3 h-3" />
                        Analyze Fault
                      </>
                    )}
                  </button>
                )}
              </div>
              
              <div className="divide-y divide-slate-100">
                {group.map((claim) => (
                  <button
                    key={claim.id}
                    onClick={() => onSelect(claim)}
                    className="w-full flex items-center gap-4 p-6 hover:bg-slate-50 transition-colors text-left group"
                  >
                    <div className="relative flex-shrink-0">
                      <div className="relative w-20 h-20 rounded-xl overflow-hidden border border-slate-200 bg-slate-100">
                        {claim.mediaItems?.[0]?.mediaType === 'video' ? (
                          claim.mediaItems[0].imageUrl ? (
                            <div className="w-full h-full" onClick={e => e.stopPropagation()}>
                              <video
                                src={claim.mediaItems[0].imageUrl}
                                controls
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 gap-1">
                              <Video className="w-7 h-7" />
                              <span className="text-[9px] font-black uppercase tracking-wider">Video</span>
                            </div>
                          )
                        ) : claim.mediaItems?.[0]?.imageUrl ? (
                          <img src={claim.mediaItems[0].imageUrl} alt="Claim" className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-300">
                            <ImageIcon className="w-8 h-8" />
                          </div>
                        )}
                      </div>
                      {(claim.mediaItems?.length ?? 0) > 1 && (
                        <div className="absolute -bottom-1.5 -right-1.5 bg-slate-800 text-white text-[9px] font-black rounded-full w-5 h-5 flex items-center justify-center leading-none">
                          +{claim.mediaItems.length - 1}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-grow min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-slate-900 truncate">
                          {claim.description.substring(0, 60)}...
                        </h3>
                        {isOfficer && (
                          claim.status === 'SUSPICIOUS' ? (
                            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-50 text-red-600 text-[10px] font-bold uppercase tracking-tight">
                              <ShieldAlert className="w-3 h-3" /> Suspicious
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-bold uppercase tracking-tight">
                              <ShieldCheck className="w-3 h-3" /> Clean
                            </span>
                          )
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(claim.timestamp).toLocaleDateString()}
                        </span>
                        <span className="font-mono">ID: {claim.id}</span>
                        {isOfficer && <span className="font-medium text-slate-700">Client: {claim.clientId}</span>}
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      {isOfficer && (
                        <div className="text-right">
                          <div className="text-[10px] font-bold text-slate-400 uppercase">Suspicion Score</div>
                          <div className={cn(
                            "text-lg font-bold leading-none",
                            claim.verdictScore > 70 ? "text-red-600" : 
                            claim.verdictScore > 40 ? "text-orange-500" : "text-emerald-600"
                          )}>
                            {Math.round(claim.verdictScore)}%
                          </div>
                        </div>
                      )}
                      <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-slate-600 transition-colors" />
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {claims.length === 0 && (
          <div className="text-center py-20 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 mb-4">
              <Clock className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900">No claims found</h3>
            <p className="text-slate-500">New claims will appear here once submitted.</p>
          </div>
        )}
      </div>
    </div>
  );
}
