'use client';

import { useState, useEffect } from 'react';
import { Claim, Role } from '@/lib/types';

const DB_KEY = 'fraudlens_claims_db';
const THUMB_MAX_PX = 800;
const THUMB_QUALITY = 0.6;

// Compress a base64 image down to a small thumbnail for localStorage.
// Videos are not compressible this way — store an empty string instead
// (the full data stays in React state for the current session).
function compressForStorage(imageUrl: string, mediaType: 'image' | 'video'): Promise<string> {
  if (mediaType === 'video') return Promise.resolve('');
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, THUMB_MAX_PX / Math.max(img.width, img.height));
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL('image/jpeg', THUMB_QUALITY));
    };
    img.onerror = () => resolve('');
    img.src = imageUrl;
  });
}

export function useClaims() {
  const [claims, setClaims] = useState<Claim[]>([]);
  const [currentRole, setCurrentRole] = useState<Role>('officer');

  useEffect(() => {
    const saved = localStorage.getItem(DB_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const timeoutId = setTimeout(() => setClaims(parsed), 0);
        return () => clearTimeout(timeoutId);
      } catch (e) {
        console.error('Failed to parse claims', e);
      }
    }
  }, []);

  const addClaim = async (claim: Claim) => {
    // Keep the full-resolution image in React state for the current session
    const updated = [claim, ...claims];
    setClaims(updated);

    // Compress before writing to localStorage to stay under the 5MB quota
    const compressedImageUrl = await compressForStorage(claim.imageUrl, claim.mediaType);
    const claimForStorage = { ...claim, imageUrl: compressedImageUrl };
    const updatedForStorage = [claimForStorage, ...claims.map(c => ({ ...c, imageUrl: c.imageUrl }))];

    try {
      localStorage.setItem(DB_KEY, JSON.stringify(updatedForStorage));
    } catch (e) {
      console.warn('localStorage quota exceeded even after compression — skipping persist', e);
    }
  };

  const getVisibleClaims = () => {
    if (currentRole === 'officer') return claims;
    return claims.filter(c => c.clientId === currentRole);
  };

  return {
    claims: getVisibleClaims(),
    allClaims: claims,
    currentRole,
    setCurrentRole,
    addClaim,
  };
}
