'use client';

import React from 'react';
import { FaultAnalysis } from '@/lib/types';
import { 
  X, 
  Scale, 
  AlertCircle, 
  CheckCircle2, 
  TrendingUp,
  Info,
  ShieldAlert
} from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';

interface FaultAnalysisModalProps {
  analysis: FaultAnalysis;
  onClose: () => void;
}

export function FaultAnalysisModal({ analysis, onClose }: FaultAnalysisModalProps) {
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
        className="bg-white w-full max-w-4xl max-h-[90vh] rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col border border-white/20"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-indigo-100 text-indigo-600 shadow-sm">
              <Scale className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Fault Determination: {analysis.claimNumber}</h2>
              <p className="text-sm text-slate-500">Multi-party incident analysis</p>
            </div>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-slate-200 rounded-2xl transition-all active:scale-95">
            <X className="w-6 h-6 text-slate-500" />
          </button>
        </div>

        <div className="flex-grow overflow-y-auto p-8 lg:p-12">
          <div className="space-y-10">
            {/* Verdict Section */}
            <section>
              <div className="bg-indigo-50 border border-indigo-100 p-8 rounded-[2.5rem] relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                  <Scale className="w-32 h-32 text-indigo-900" />
                </div>
                <div className="relative z-10">
                  <h3 className="text-xs font-black text-indigo-400 uppercase tracking-[0.2em] mb-4">Official Verdict</h3>
                  <p className="text-2xl font-bold text-indigo-900 leading-tight mb-4">{analysis.verdict}</p>
                  <p className="text-slate-600 leading-relaxed">{analysis.reasoning}</p>
                </div>
              </div>
            </section>

            {/* Parties Comparison */}
            <section>
              <h3 className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-6">
                <TrendingUp className="w-4 h-4" /> Party Responsibility Breakdown
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {analysis.parties.map((party, idx) => (
                  <div key={idx} className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center font-bold text-slate-600">
                          {party.clientId.slice(-2).toUpperCase()}
                        </div>
                        <div>
                          <div className="text-sm font-bold text-slate-900">Client ID: {party.clientId}</div>
                          <div className={cn(
                            "text-[10px] font-black uppercase tracking-widest",
                            party.riskLevel === 'HIGH' ? "text-red-500" : 
                            party.riskLevel === 'MEDIUM' ? "text-orange-500" : "text-emerald-500"
                          )}>
                            Risk Level: {party.riskLevel}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Fault Score</div>
                        <div className={cn(
                          "text-3xl font-black tracking-tighter",
                          party.faultScore > 50 ? "text-red-600" : "text-emerald-600"
                        )}>
                          {party.faultScore}%
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className={cn(
                            "h-full transition-all duration-1000",
                            party.faultScore > 50 ? "bg-red-500" : "bg-emerald-500"
                          )}
                          style={{ width: `${party.faultScore}%` }}
                        />
                      </div>
                      
                      <div>
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Contributing Factors</div>
                        <ul className="space-y-2">
                          {party.contributingFactors.map((factor, fIdx) => (
                            <li key={fIdx} className="text-xs text-slate-600 flex items-start gap-2 bg-slate-50 p-3 rounded-xl border border-slate-100">
                              <Info className="w-3 h-3 mt-0.5 text-slate-400 flex-shrink-0" />
                              {factor}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>

        <div className="p-8 bg-slate-50/50 border-t border-slate-100 flex justify-end">
          <button 
            onClick={onClose}
            className="px-8 py-3 rounded-2xl bg-slate-900 text-white font-bold hover:bg-slate-800 transition-all active:scale-95 shadow-lg shadow-slate-200"
          >
            Acknowledge Analysis
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
