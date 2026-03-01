import { NextRequest, NextResponse } from 'next/server';
import { analyzeAuthenticity } from '@/lib/gemini';
import { MediaType } from '@/lib/types';

export async function POST(request: NextRequest) {
  if (!process.env.GEMINI_API_KEY) {
    return NextResponse.json({ error: 'GEMINI_API_KEY not set' }, { status: 500 });
  }

  try {
    const { mediaBase64, mediaType } = await request.json() as {
      mediaBase64: string;
      mediaType: MediaType;
    };

    const gemini = await analyzeAuthenticity(mediaBase64, mediaType);
    return NextResponse.json({ gemini });
  } catch (err) {
    console.error('[analyze-authenticity]', err);
    return NextResponse.json({ error: 'Analysis failed' }, { status: 500 });
  }
}
