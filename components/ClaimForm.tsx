'use client';

import React, { useState } from 'react';
import { Camera, Video, Send, Loader2, X, Plus } from 'lucide-react';
import { calculateVerdict, calculateOverallVerdict } from '@/lib/gemini';
import { Claim, MediaItem, MediaType } from '@/lib/types';
import { motion, AnimatePresence } from 'motion/react';

interface ClaimFormProps {
  clientId: string;
  onSuccess: (claim: Claim) => void;
}

interface FileEntry {
  id: string;
  dataUrl: string;
  mediaType: MediaType;
}

const MAX_FILE_MB = 25;

export function ClaimForm({ clientId, onSuccess }: ClaimFormProps) {
  const [description, setDescription] = useState('');
  const [claimNumber, setClaimNumber] = useState('');
  const [files, setFiles] = useState<FileEntry[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);

  const handleMediaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files ?? []);
    e.target.value = '';

    selected.forEach(file => {
      if (file.size > MAX_FILE_MB * 1024 * 1024) {
        alert(`"${file.name}" exceeds ${MAX_FILE_MB}MB and was skipped.`);
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFiles(prev => [...prev, {
          id: Math.random().toString(36).substring(7),
          dataUrl: reader.result as string,
          mediaType: file.type.startsWith('video/') ? 'video' : 'image',
        }]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (files.length === 0 || !description || !claimNumber) return;

    setIsSubmitting(true);
    setAnalysisProgress(0);
    try {
      const mediaItems: MediaItem[] = await Promise.all(
        files.map(async (f) => {
          const [authRes, consRes] = await Promise.all([
            fetch('/api/analyze-authenticity', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ mediaBase64: f.dataUrl, mediaType: f.mediaType }),
            }).then(r => r.json()),
            fetch('/api/analyze-consistency', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ mediaBase64: f.dataUrl, description, mediaType: f.mediaType }),
            }).then(r => r.json()),
          ]);

          setAnalysisProgress(prev => prev + 1);

          const { status, score } = calculateVerdict(authRes.gemini, consRes);
          return {
            id: f.id,
            imageUrl: f.dataUrl,
            mediaType: f.mediaType,
            authenticity: authRes.gemini,
            consistency: consRes,
            verdictScore: score,
            status,
          } satisfies MediaItem;
        })
      );

      const { status, score } = calculateOverallVerdict(mediaItems);
      const first = mediaItems[0];

      const newClaim: Claim = {
        id: Math.random().toString(36).substring(7),
        claimNumber,
        clientId,
        description,
        mediaItems,
        imageUrl: first.imageUrl,
        mediaType: first.mediaType,
        timestamp: Date.now(),
        status,
        verdictScore: score,
        authenticity: first.authenticity,
        consistency: first.consistency,
      };

      onSuccess(newClaim);
      setDescription('');
      setClaimNumber('');
      setFiles([]);
    } catch (error) {
      console.error('Submission failed', error);
      alert('Failed to process claim. Please try again.');
    } finally {
      setIsSubmitting(false);
      setAnalysisProgress(0);
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
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-slate-700">
              Evidence Photos &amp; Videos
              <span className="ml-2 text-xs text-slate-400 font-normal">Max {MAX_FILE_MB}MB each</span>
            </label>
            {files.length > 0 && (
              <span className="text-xs text-slate-500 font-medium">
                {files.length} file{files.length !== 1 ? 's' : ''} selected
              </span>
            )}
          </div>

          {files.length > 0 ? (
            <div className="grid grid-cols-3 gap-2">
              <AnimatePresence>
                {files.map((f) => (
                  <motion.div
                    key={f.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="relative aspect-square rounded-xl overflow-hidden border border-slate-200 bg-slate-900 group"
                  >
                    {f.mediaType === 'video' ? (
                      <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 gap-1">
                        <Video className="w-7 h-7" />
                        <span className="text-[9px] font-bold uppercase tracking-wider">Video</span>
                      </div>
                    ) : (
                      <img src={f.dataUrl} alt="Preview" className="w-full h-full object-cover" />
                    )}
                    <button
                      type="button"
                      onClick={() => removeFile(f.id)}
                      className="absolute top-1 right-1 p-1 rounded-full bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>

              <label
                htmlFor="media-upload"
                className="aspect-square rounded-xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center cursor-pointer hover:border-emerald-500 hover:bg-slate-50 transition-all text-slate-400 hover:text-emerald-500"
              >
                <Plus className="w-6 h-6 mb-1" />
                <span className="text-[10px] font-bold uppercase tracking-wider">Add More</span>
              </label>
            </div>
          ) : (
            <label
              htmlFor="media-upload"
              className="flex flex-col items-center justify-center w-full aspect-video border-2 border-dashed border-slate-200 rounded-3xl cursor-pointer hover:bg-slate-50 hover:border-emerald-500 transition-all group"
            >
              <div className="flex flex-col items-center text-slate-400 group-hover:text-emerald-500">
                <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-emerald-50 transition-colors">
                  <div className="flex gap-2">
                    <Camera className="w-6 h-6" />
                    <Video className="w-6 h-6" />
                  </div>
                </div>
                <span className="text-sm font-bold">Click to upload photos or videos</span>
                <span className="text-xs text-slate-400 mt-1">Multiple files supported — each gets its own AI analysis</span>
              </div>
            </label>
          )}

          <input
            type="file"
            accept="image/*,video/*"
            multiple
            onChange={handleMediaChange}
            className="hidden"
            id="media-upload"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting || files.length === 0}
          className="w-full bg-slate-900 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Analyzed {analysisProgress}/{files.length} items...
            </>
          ) : (
            <>
              <Send className="w-5 h-5" />
              Submit Claim{files.length > 1 ? ` (${files.length} files)` : ''}
            </>
          )}
        </button>
      </form>
    </motion.div>
  );
}
