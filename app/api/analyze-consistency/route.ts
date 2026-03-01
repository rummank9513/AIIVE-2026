import { NextRequest, NextResponse } from 'next/server';
import { analyzeConsistency } from '@/lib/gemini';
import { MediaType } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const { mediaBase64, description, mediaType } = await request.json() as {
      mediaBase64: string;
      description: string;
      mediaType: MediaType;
    };

    const result = await analyzeConsistency(mediaBase64, description, mediaType);
    return NextResponse.json(result);
  } catch (err) {
    console.error('[analyze-consistency]', err);
    return NextResponse.json({ error: 'Analysis failed' }, { status: 500 });
  }
}
