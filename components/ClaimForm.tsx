'use client';

import React, { useState } from 'react';
import { Camera, Upload, Send, Loader2 } from 'lucide-react';
import { analyzeAuthenticity, analyzeConsistency, calculateVerdict } from '@/lib/gemini';
import { Claim } from '@/lib/types';
import { motion } from 'motion/react';

interface ClaimFormProps {
  clientId: string;
  onSuccess: (claim: Claim) => void;
}

export function ClaimForm({ clientId, onSuccess }: ClaimFormProps) {
  const [description, setDescription] = useState('');
  const [claimNumber, setClaimNumber] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!image || !description || !claimNumber) return;

    setIsSubmitting(true);
    try {
      // Step 1: Authenticity
      const authResult = await analyzeAuthenticity(image);
      
      // Step 2: Consistency
      const consResult = await analyzeConsistency(image, description);
      
      // Step 3: Verdict
      const { status, score } = calculateVerdict(authResult, consResult);

      const newClaim: Claim = {
        id: Math.random().toString(36).substring(7),
        claimNumber,
        clientId,
        description,
        imageUrl: image,
        timestamp: Date.now(),
        status,
        verdictScore: score,
        authenticity: authResult,
        consistency: consResult
      };

      onSuccess(newClaim);
      setDescription('');
      setClaimNumber('');
      setImage(null);
    } catch (error) {
      console.error("Submission failed", error);
      alert("Failed to process claim. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200"
    >
      <h2 className="text-xl font-semibold mb-4 text-slate-900">File New Claim</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Claim Number</label>
          <input
            type="text"
            required
            value={claimNumber}
            onChange={(e) => setClaimNumber(e.target.value)}
            className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
            placeholder="e.g. CLM-12345"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Accident Description</label>
          <textarea
            required
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all h-32 resize-none"
            placeholder="Describe what happened, where the damage is, and how it occurred..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Evidence Photo</label>
          <div className="relative">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
              id="image-upload"
              required
            />
            
            {image ? (
              <div className="relative group">
                <div className="w-full aspect-video bg-slate-900 rounded-2xl overflow-hidden border border-slate-200 shadow-inner">
                  <img 
                    src={image} 
                    alt="Preview" 
                    className="w-full h-full object-contain" 
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setImage(null)}
                  className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm text-slate-900 p-2 rounded-xl shadow-lg hover:bg-white transition-all active:scale-95"
                >
                  <Camera className="w-5 h-5" />
                </button>
                <label
                  htmlFor="image-upload"
                  className="absolute bottom-4 right-4 bg-slate-900/90 backdrop-blur-sm text-white px-4 py-2 rounded-xl shadow-lg hover:bg-slate-900 transition-all cursor-pointer text-xs font-bold uppercase tracking-wider"
                >
                  Change Photo
                </label>
              </div>
            ) : (
              <label
                htmlFor="image-upload"
                className="flex flex-col items-center justify-center w-full aspect-video border-2 border-dashed border-slate-200 rounded-3xl cursor-pointer hover:bg-slate-50 hover:border-emerald-500 transition-all group"
              >
                <div className="flex flex-col items-center text-slate-400 group-hover:text-emerald-500">
                  <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-emerald-50 transition-colors">
                    <Camera className="w-8 h-8" />
                  </div>
                  <span className="text-sm font-bold">Click to upload or take photo</span>
                  <span className="text-xs text-slate-400 mt-1">High quality photos help analysis</span>
                </div>
              </label>
            )}
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-slate-900 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Analyzing Claim...
            </>
          ) : (
            <>
              <Send className="w-5 h-5" />
              Submit Claim
            </>
          )}
        </button>
      </form>
    </motion.div>
  );
}
