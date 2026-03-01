import { GoogleGenAI, Type } from "@google/genai";
import { AuthenticityResult, ConsistencyResult, Claim, FaultAnalysis } from "./types";

function getAI() {
  return new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
}

export async function analyzeFault(claims: Claim[]): Promise<FaultAnalysis> {
  const ai = getAI();
  const model = "gemini-3.1-pro-preview";
  
  const claimSummaries = claims.map(c => ({
    clientId: c.clientId,
    description: c.description,
    verdictScore: c.verdictScore,
    status: c.status,
    authenticityReasoning: c.authenticity.reasoning,
    consistencyReasoning: c.consistency.reasoning
  }));

  const response = await ai.models.generateContent({
    model,
    contents: [
      {
        parts: [
          {
            text: `You are a senior insurance claims adjuster. 
            Below are multiple claims filed for the same accident (Claim Number: ${claims[0].claimNumber}).
            Analyze the descriptions and the AI-generated fraud/consistency scores to determine who is most likely at fault.
            
            Consider:
            - If one party has a high "Suspicion Score" or AI manipulation flags, their testimony is less reliable.
            - Compare the descriptions for contradictions.
            - Look for admissions of fault or descriptions of maneuvers that typically assign fault (e.g., rear-ending, failing to yield).
            
            Claims Data:
            ${JSON.stringify(claimSummaries, null, 2)}
            
            Return a JSON object with the following structure:
            {
              "claimNumber": "${claims[0].claimNumber}",
              "verdict": "Summary of who is at fault",
              "reasoning": "Detailed explanation of the decision",
              "parties": [
                {
                  "clientId": "string",
                  "faultScore": number (0-100),
                  "riskLevel": "LOW" | "MEDIUM" | "HIGH",
                  "contributingFactors": ["string"]
                }
              ]
            }`
          }
        ]
      }
    ],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          claimNumber: { type: Type.STRING },
          verdict: { type: Type.STRING },
          reasoning: { type: Type.STRING },
          parties: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                clientId: { type: Type.STRING },
                faultScore: { type: Type.NUMBER },
                riskLevel: { type: Type.STRING, enum: ["LOW", "MEDIUM", "HIGH"] },
                contributingFactors: { type: Type.ARRAY, items: { type: Type.STRING } }
              },
              required: ["clientId", "faultScore", "riskLevel", "contributingFactors"]
            }
          }
        },
        required: ["claimNumber", "verdict", "reasoning", "parties"]
      }
    }
  });

  return JSON.parse(response.text || "{}");
}

export async function analyzeAuthenticity(imageBase64: string): Promise<AuthenticityResult> {
  const ai = getAI();
  const model = "gemini-3.1-pro-preview";
  
  const response = await ai.models.generateContent({
    model,
    contents: [
      {
        parts: [
          {
            text: `Analyze this image of a vehicle for signs of AI generation or intentional digital manipulation. 
            IMPORTANT: Do not mistake low image quality, motion blur, or standard JPEG compression artifacts for AI generation.
            
            Look specifically for:
            - Impossible geometry in the car's body lines.
            - Textures that "melt" into each other (e.g., a tire merging with the pavement).
            - Nonsensical text on license plates or badges.
            - Cloning artifacts where the exact same scratch pattern is repeated perfectly.
            - Lighting that comes from multiple conflicting directions.
            
            Be conservative: if you are unsure, do not flag as AI generated.
            
            Return a JSON object with the following structure:
            {
              "is_ai_generated": boolean,
              "is_ai_altered": boolean,
              "confidence_score": number (0-100),
              "flags": string[],
              "reasoning": string
            }`
          },
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: imageBase64.split(',')[1] || imageBase64
            }
          }
        ]
      }
    ],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          is_ai_generated: { type: Type.BOOLEAN },
          is_ai_altered: { type: Type.BOOLEAN },
          confidence_score: { type: Type.NUMBER },
          flags: { type: Type.ARRAY, items: { type: Type.STRING } },
          reasoning: { type: Type.STRING }
        },
        required: ["is_ai_generated", "is_ai_altered", "confidence_score", "flags", "reasoning"]
      }
    }
  });

  return JSON.parse(response.text || "{}");
}

export async function analyzeConsistency(imageBase64: string, description: string): Promise<ConsistencyResult> {
  const ai = getAI();
  const model = "gemini-3.1-pro-preview";

  const response = await ai.models.generateContent({
    model,
    contents: [
      {
        parts: [
          {
            text: `You are an insurance fraud analyst.
            User's accident description: "${description}"
            Analyze the uploaded image of the vehicle damage and compare it against the description above.
            
            Evaluate:
            - Does the damage LOCATION match the description?
            - Does the damage SEVERITY match the description?
            - Are there any damages visible that were NOT mentioned?
            - Does the damage TYPE make sense given how the accident was described?
            
            Return a JSON object with the following structure:
            {
              "location_match": boolean,
              "severity_match": boolean,
              "undisclosed_damage": boolean,
              "damage_type_consistent": boolean,
              "inconsistencies": string[],
              "consistency_score": number (0-100),
              "reasoning": string
            }`
          },
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: imageBase64.split(',')[1] || imageBase64
            }
          }
        ]
      }
    ],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          location_match: { type: Type.BOOLEAN },
          severity_match: { type: Type.BOOLEAN },
          undisclosed_damage: { type: Type.BOOLEAN },
          damage_type_consistent: { type: Type.BOOLEAN },
          inconsistencies: { type: Type.ARRAY, items: { type: Type.STRING } },
          consistency_score: { type: Type.NUMBER },
          reasoning: { type: Type.STRING }
        },
        required: ["location_match", "severity_match", "undisclosed_damage", "damage_type_consistent", "inconsistencies", "consistency_score", "reasoning"]
      }
    }
  });

  return JSON.parse(response.text || "{}");
}

export function calculateVerdict(auth: AuthenticityResult, cons: ConsistencyResult): { status: 'SUSPICIOUS' | 'CLEAN', score: number } {
  let suspicionScore = 0;
  
  // AI Generation is a huge red flag, but only if confidence is high
  if (auth.is_ai_generated && auth.confidence_score > 70) suspicionScore += 70;
  else if (auth.is_ai_generated) suspicionScore += 40;
  
  if (auth.is_ai_altered && auth.confidence_score > 70) suspicionScore += 40;
  else if (auth.is_ai_altered) suspicionScore += 20;
  
  // Consistency score is 0-100 (where 100 is perfectly consistent)
  // Only add to suspicion if consistency is significantly low
  if (cons.consistency_score < 80) {
    suspicionScore += (80 - cons.consistency_score) * 0.8;
  }
  
  // Cap at 100
  suspicionScore = Math.round(Math.min(100, suspicionScore));
  
  return {
    status: suspicionScore > 50 ? 'SUSPICIOUS' : 'CLEAN',
    score: suspicionScore
  };
}
