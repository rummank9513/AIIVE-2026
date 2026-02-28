'use client';

import React, { useState } from 'react';
import { useClaims } from '@/hooks/use-claims';
import { RoleSwitcher } from '@/components/RoleSwitcher';
import { ClaimForm } from '@/components/ClaimForm';
import { ClaimList } from '@/components/ClaimList';
import { ClaimDetail } from '@/components/ClaimDetail';
import { FaultAnalysisModal } from '@/components/FaultAnalysisModal';
import { Claim, FaultAnalysis } from '@/lib/types';
import { analyzeFault } from '@/lib/gemini';
import { Shield, FileText, AlertTriangle, CheckCircle2, LayoutDashboard } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';

export default function Home() {
  const { claims, allClaims, currentRole, setCurrentRole, addClaim } = useClaims();
  const [selectedClaim, setSelectedClaim] = useState<Claim | null>(null);
  const [faultAnalysis, setFaultAnalysis] = useState<FaultAnalysis | null>(null);
  const [isAnalyzingFault, setIsAnalyzingFault] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  const handleAnalyzeFault = async (group: Claim[]) => {
    setIsAnalyzingFault(group[0].claimNumber);
    try {
      const result = await analyzeFault(group);
      setFaultAnalysis(result);
    } catch (error) {
      console.error("Fault analysis failed", error);
      alert("Failed to analyze fault. Please try again.");
    } finally {
      setIsAnalyzingFault(null);
    }
  };

  const stats = {
    total: allClaims.length,
    suspicious: allClaims.filter(c => c.status === 'SUSPICIOUS').length,
    clean: allClaims.filter(c => c.status === 'CLEAN').length,
  };

  return (
    <main className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight">FraudLens AI</h1>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Insurance Verification</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <RoleSwitcher currentRole={currentRole} onRoleChange={setCurrentRole} />
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Sidebar Stats (Officer only) */}
          {currentRole === 'officer' && (
            <div className="lg:col-span-3 space-y-6">
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                <h2 className="flex items-center gap-2 text-sm font-bold text-slate-400 uppercase tracking-widest mb-6">
                  <LayoutDashboard className="w-4 h-4" /> Dashboard
                </h2>
                
                <div className="space-y-4">
                  <StatCard label="Total Claims" value={stats.total} icon={<FileText className="w-4 h-4" />} color="slate" />
                  <StatCard label="Suspicious" value={stats.suspicious} icon={<AlertTriangle className="w-4 h-4" />} color="red" />
                  <StatCard label="Clean" value={stats.clean} icon={<CheckCircle2 className="w-4 h-4" />} color="emerald" />
                </div>
              </div>

              <div className="bg-slate-900 p-6 rounded-3xl text-white">
                <h3 className="font-bold mb-2">AI Insights</h3>
                <p className="text-xs text-slate-400 leading-relaxed mb-4">
                  Our models are currently detecting inconsistencies in {Math.round((stats.suspicious / (stats.total || 1)) * 100)}% of submitted claims.
                </p>
                <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-emerald-500 transition-all duration-1000" 
                    style={{ width: `${(stats.clean / (stats.total || 1)) * 100}%` }} 
                  />
                </div>
              </div>
            </div>
          )}

          {/* Main Content */}
          <div className={currentRole === 'officer' ? "lg:col-span-9" : "lg:col-span-12 max-w-4xl mx-auto w-full"}>
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold tracking-tight text-slate-900">
                  {currentRole === 'officer' ? 'Claims Overview' : 'My Insurance Claims'}
                </h2>
                <p className="text-slate-500 mt-1">
                  {currentRole === 'officer' 
                    ? 'Review and manage all insurance claims across the platform.' 
                    : 'Submit new claims and track their verification status.'}
                </p>
              </div>
              
              {currentRole !== 'officer' && (
                <button
                  onClick={() => setShowForm(!showForm)}
                  className="bg-slate-900 text-white px-6 py-3 rounded-2xl font-semibold hover:bg-slate-800 transition-all shadow-lg shadow-slate-200 flex items-center gap-2"
                >
                  {showForm ? 'Cancel' : 'File New Claim'}
                </button>
              )}
            </div>

            <div className="space-y-8">
              {showForm && currentRole !== 'officer' && (
                <ClaimForm 
                  clientId={currentRole} 
                  onSuccess={(claim) => {
                    addClaim(claim);
                    setShowForm(false);
                  }} 
                />
              )}

              <ClaimList 
                claims={claims} 
                onSelect={setSelectedClaim} 
                role={currentRole}
                onAnalyzeFault={handleAnalyzeFault}
                isAnalyzingFault={isAnalyzingFault}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {selectedClaim && (
          <ClaimDetail 
            claim={selectedClaim} 
            onClose={() => setSelectedClaim(null)} 
            role={currentRole}
          />
        )}
        {faultAnalysis && (
          <FaultAnalysisModal 
            analysis={faultAnalysis} 
            onClose={() => setFaultAnalysis(null)} 
          />
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="mt-20 border-t border-slate-200 py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Shield className="w-5 h-5 text-slate-400" />
            <span className="font-bold text-slate-400 uppercase tracking-widest text-xs">FraudLens AI Security</span>
          </div>
          <p className="text-slate-400 text-xs">
            Powered by Gemini 3.1 Pro. All claims are analyzed for authenticity and consistency.
          </p>
        </div>
      </footer>
    </main>
  );
}

function StatCard({ label, value, icon, color }: { label: string, value: number, icon: React.ReactNode, color: 'slate' | 'red' | 'emerald' }) {
  const colors = {
    slate: "bg-slate-50 text-slate-600 border-slate-100",
    red: "bg-red-50 text-red-600 border-red-100",
    emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
  };

  return (
    <div className={cn("p-4 rounded-2xl border flex items-center justify-between", colors[color])}>
      <div className="flex items-center gap-3">
        <div className={cn("p-2 rounded-lg", color === 'slate' ? "bg-white" : "bg-white/50")}>
          {icon}
        </div>
        <span className="text-sm font-semibold">{label}</span>
      </div>
      <span className="text-xl font-bold">{value}</span>
    </div>
  );
}
