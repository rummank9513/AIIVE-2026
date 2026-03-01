import { NextRequest, NextResponse } from 'next/server';
import { analyzeFault } from '@/lib/gemini';
import { Claim } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const { claims } = await request.json() as { claims: Claim[] };
    const result = await analyzeFault(claims);
    return NextResponse.json(result);
  } catch (err) {
    console.error('[analyze-fault]', err);
    return NextResponse.json({ error: 'Analysis failed' }, { status: 500 });
  }
}
