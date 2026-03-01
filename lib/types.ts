export type Role = 'client1' | 'client2' | 'officer';
export type MediaType = 'image' | 'video';

export interface AuthenticityResult {
  is_ai_generated: boolean;
  is_ai_altered: boolean;
  confidence_score: number;
  flags: string[];
  reasoning: string;
}


export interface ConsistencyResult {
  location_match: boolean;
  severity_match: boolean;
  undisclosed_damage: boolean;
  damage_type_consistent: boolean;
  inconsistencies: string[];
  consistency_score: number;
  reasoning: string;
}

export interface FaultAnalysis {
  claimNumber: string;
  verdict: string;
  reasoning: string;
  parties: {
    clientId: string;
    faultScore: number; // 0-100
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
    contributingFactors: string[];
  }[];
}

export interface MediaItem {
  id: string;
  imageUrl: string;
  mediaType: MediaType;
  authenticity: AuthenticityResult;
  consistency: ConsistencyResult;
  verdictScore: number;
  status: 'SUSPICIOUS' | 'CLEAN';
}

export interface Claim {
  id: string;
  claimNumber: string;
  clientId: string;
  description: string;
  mediaItems: MediaItem[];
  // Convenience fields derived from mediaItems[0] for backward compat
  imageUrl: string;
  mediaType: MediaType;
  timestamp: number;
  status: 'SUSPICIOUS' | 'CLEAN';
  verdictScore: number;
  authenticity: AuthenticityResult;
  consistency: ConsistencyResult;
}
