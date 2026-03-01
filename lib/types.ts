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

export interface Claim {
  id: string;
  claimNumber: string;
  clientId: string;
  description: string;
  imageUrl: string;
  mediaType: MediaType;
  timestamp: number;
  status: 'SUSPICIOUS' | 'CLEAN';
  verdictScore: number;
  authenticity: AuthenticityResult;
  consistency: ConsistencyResult;
}
