'use client';

import React, { useState, useEffect } from 'react';
import { Claim, Role } from '@/lib/types';

// Mock database in localStorage for persistence in this session
const DB_KEY = 'fraudlens_claims_db';

export function useClaims() {
  const [claims, setClaims] = useState<Claim[]>([]);
  const [currentRole, setCurrentRole] = useState<Role>('officer');

  useEffect(() => {
    const saved = localStorage.getItem(DB_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Delay to avoid synchronous state update warning
        const timeoutId = setTimeout(() => {
          setClaims(parsed);
        }, 0);
        return () => clearTimeout(timeoutId);
      } catch (e) {
        console.error("Failed to parse claims", e);
      }
    }
  }, []);

  const addClaim = (claim: Claim) => {
    const updated = [claim, ...claims];
    setClaims(updated);
    localStorage.setItem(DB_KEY, JSON.stringify(updated));
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
    addClaim
  };
}
