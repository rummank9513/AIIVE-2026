'use client';

import { useState, useEffect } from 'react';
import { Claim, MediaItem, Role } from '@/lib/types';

const DB_KEY = 'aiive_claims_db';
const THUMB_MAX_PX = 800;
const THUMB_QUALITY = 0.6;

function compressForStorage(imageUrl: string, mediaType: 'image' | 'video'): Promise<string> {
  if (mediaType === 'video') return Promise.resolve('');
  if (!imageUrl) return Promise.resolve('');
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

// Migrate old single-media claims that don't have mediaItems
function migrateClaim(raw: any): Claim {
  if (raw.mediaItems && Array.isArray(raw.mediaItems)) return raw as Claim;
  const item: MediaItem = {
    id: raw.id + '_0',
    imageUrl: raw.imageUrl || '',
    mediaType: raw.mediaType || 'image',
    authenticity: raw.authenticity,
    consistency: raw.consistency,
    verdictScore: raw.verdictScore,
    status: raw.status,
  };
  return { ...raw, mediaItems: [item] } as Claim;
}

export function useClaims() {
  const [claims, setClaims] = useState<Claim[]>([]);
  const [currentRole, setCurrentRole] = useState<Role>('officer');

  useEffect(() => {
    const saved = localStorage.getItem(DB_KEY);
    if (saved) {
      try {
        const parsed: any[] = JSON.parse(saved);
        const migrated = parsed.map(migrateClaim);
        const timeoutId = setTimeout(() => setClaims(migrated), 0);
        return () => clearTimeout(timeoutId);
      } catch (e) {
        console.error('Failed to parse claims', e);
      }
    }
  }, []);

  const addClaim = async (claim: Claim) => {
    const updated = [claim, ...claims];
    setClaims(updated);

    // Compress each media item's imageUrl before writing to localStorage
    const compressedItems: MediaItem[] = await Promise.all(
      claim.mediaItems.map(async (item) => ({
        ...item,
        imageUrl: await compressForStorage(item.imageUrl, item.mediaType),
      }))
    );
    const compressedFirst = compressedItems[0];
    const claimForStorage: Claim = {
      ...claim,
      mediaItems: compressedItems,
      imageUrl: compressedFirst?.imageUrl ?? '',
      mediaType: compressedFirst?.mediaType ?? 'image',
    };

    const updatedForStorage = [claimForStorage, ...claims];

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
