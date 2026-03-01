'use client';

import React from 'react';
import { Claim, Role } from '@/lib/types';
import {
  X,
  ShieldAlert,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  Clock,
  FileText,
  Image as ImageIcon,
  Video,
  Maximize2,
} from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';

interface ClaimDetailProps {
  claim: Claim;
  onClose: () => void;
  role: Role;
}

export function ClaimDetail({ claim, onClose, role }: ClaimDetailProps) {
  const isOfficer = role === 'officer';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="bg-white w-full max-w-5xl max-h-[95vh] rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col border border-white/20"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-4">
            <div className={cn(
              "p-3 rounded-2xl shadow-sm",
              claim.status === 'SUSPICIOUS' ? "bg-red-100 text-red-600" : "bg-emerald-100 text-emerald-600"
            )}>
              {claim.status === 'SUSPICIOUS' ? <ShieldAlert className="w-6 h-6" /> : <ShieldCheck className="w-6 h-6" />}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Claim: {claim.claimNumber}</h2>
              <div className="flex items-center gap-3 text-sm text-slate-500">
                <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {new Date(claim.timestamp).toLocaleString()}</span>
                <span className="w-1 h-1 rounded-full bg-slate-300" />
                <span className="font-mono">ID: {claim.id}</span>
                {claim.mediaType === 'video' && (
                  <span className="flex items-center gap-1 text-indigo-500 font-semibold">
                    <Video className="w-3 h-3" /> Video
                  </span>
                )}
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-slate-200 rounded-2xl transition-all active:scale-95">
            <X className="w-6 h-6 text-slate-500" />
          </button>
        </div>

        <div className="flex-grow overflow-y-auto p-8 lg:p-12">
          <div className={cn(
            "grid grid-cols-1 gap-12",
            isOfficer ? "lg:grid-cols-2" : "max-w-3xl mx-auto"
          )}>
            {/* Left Column: Media + Description */}
            <div className="space-y-8">
              <section>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-[0.2em]">
                    {claim.mediaType === 'video'
                      ? <><Video className="w-4 h-4" /> Evidence Video</>
                      : <><ImageIcon className="w-4 h-4" /> Evidence Photo</>
                    }
                  </h3>
                  <button className="text-slate-400 hover:text-slate-600 transition-colors">
                    <Maximize2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="group relative aspect-[4/3] rounded-[2rem] overflow-hidden border border-slate-200 shadow-2xl bg-slate-900">
                  {claim.mediaType === 'video' ? (
                    <video src={claim.imageUrl} controls className="w-full h-full object-contain" />
                  ) : (
                    <img
                      src={claim.imageUrl}
                      alt="Damage"
                      className="w-full h-full object-contain transition-transform duration-700 group-hover:scale-105"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                </div>
              </section>

              <section>
                <h3 className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-4">
                  <FileText className="w-4 h-4" /> Incident Description
                </h3>
                <div className="p-8 bg-slate-50 rounded-[2rem] border border-slate-100 text-slate-700 leading-relaxed italic text-lg shadow-inner">
                  &quot;{claim.description}&quot;
                </div>
              </section>
            </div>

            {/* Right Column: Analysis (Officer Only) */}
            {isOfficer && (
              <div className="space-y-8">
                {/* Verdict Summary */}
                <div className={cn(
                  "p-8 rounded-[2.5rem] border-2 flex items-center justify-between shadow-lg",
                  claim.status === 'SUSPICIOUS' ? "bg-red-50 border-red-100" : "bg-emerald-50 border-emerald-100"
                )}>
                  <div>
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Final Verdict</div>
                    <div className={cn(
                      "text-4xl font-black uppercase tracking-tighter",
                      claim.status === 'SUSPICIOUS' ? "text-red-600" : "text-emerald-600"
                    )}>
                      {claim.status}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Risk Score</div>
                    <div className={cn(
                      "text-5xl font-black tracking-tighter",
                      claim.verdictScore > 70 ? "text-red-600" :
                      claim.verdictScore > 40 ? "text-orange-500" : "text-emerald-600"
                    )}>
                      {Math.round(claim.verdictScore)}%
                    </div>
                  </div>
                </div>

                {/* AI Authenticity Scan */}
                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="font-black text-slate-900 uppercase tracking-tight">AI Authenticity Scan</h3>
                    <div className="px-4 py-1.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-black uppercase tracking-widest">
                      Confidence: {claim.authenticity.confidence_score}%
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      {claim.authenticity.is_ai_generated || claim.authenticity.is_ai_altered ? (
                        <div className="p-2 bg-red-100 rounded-xl"><AlertCircle className="w-5 h-5 text-red-600" /></div>
                      ) : (
                        <div className="p-2 bg-emerald-100 rounded-xl"><CheckCircle2 className="w-5 h-5 text-emerald-600" /></div>
                      )}
                      <span className="text-sm font-bold text-slate-700">
                        {claim.authenticity.is_ai_generated ? "AI Generated Content Detected" :
                         claim.authenticity.is_ai_altered ? "AI Manipulation Detected" : "No AI Generation Detected"}
                      </span>
                    </div>

                    {claim.authenticity.flags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {claim.authenticity.flags.map((flag, i) => (
                          <span key={i} className="px-3 py-1 rounded-xl bg-red-50 text-red-600 text-[10px] font-black uppercase tracking-wider border border-red-100">
                            {flag}
                          </span>
                        ))}
                      </div>
                    )}

                    <p className="text-sm text-slate-500 bg-slate-50 p-5 rounded-2xl border border-slate-100 leading-relaxed">
                      {claim.authenticity.reasoning}
                    </p>
                  </div>
                </div>

                {/* Consistency Check */}
                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="font-black text-slate-900 uppercase tracking-tight">Damage Consistency</h3>
                    <div className="px-4 py-1.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-black uppercase tracking-widest">
                      Match: {claim.consistency.consistency_score}%
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-6">
                    <ConsistencyBadge label="Location" match={claim.consistency.location_match} />
                    <ConsistencyBadge label="Severity" match={claim.consistency.severity_match} />
                    <ConsistencyBadge label="Type" match={claim.consistency.damage_type_consistent} />
                    <ConsistencyBadge label="Undisclosed" match={!claim.consistency.undisclosed_damage} />
                  </div>

                  {claim.consistency.inconsistencies.length > 0 && (
                    <div className="mb-4">
                      <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Mismatches Found</div>
                      <ul className="space-y-2">
                        {claim.consistency.inconsistencies.map((inc, i) => (
                          <li key={i} className="text-sm text-red-600 font-bold flex items-start gap-3 bg-red-50/50 p-3 rounded-xl border border-red-100">
                            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                            {inc}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <p className="text-sm text-slate-500 bg-slate-50 p-5 rounded-2xl border border-slate-100 leading-relaxed">
                    {claim.consistency.reasoning}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="p-8 bg-slate-50/50 border-t border-slate-100 flex justify-end gap-4">
          <button
            onClick={onClose}
            className="px-8 py-3 rounded-2xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-100 transition-all active:scale-95"
          >
            Close Analysis
          </button>
          {isOfficer && claim.status === 'SUSPICIOUS' && (
            <button className="px-8 py-3 rounded-2xl bg-red-600 text-white font-bold hover:bg-red-700 transition-all shadow-lg shadow-red-200 flex items-center gap-2 active:scale-95">
              <ShieldAlert className="w-5 h-5" /> Route to SIU
            </button>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

function ConsistencyBadge({ label, match }: { label: string, match: boolean }) {
  return (
    <div className={cn(
      "flex items-center justify-between px-4 py-3 rounded-2xl border text-[10px] font-black uppercase tracking-widest",
      match ? "bg-emerald-50 border-emerald-100 text-emerald-700" : "bg-red-50 border-red-100 text-red-700"
    )}>
      <span>{label}</span>
      {match ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
    </div>
  );
}
