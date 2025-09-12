import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const u = new URL(req.url);
  const q = u.searchParams.get('q') ?? '';
  const lang = u.searchParams.get('lang') ?? 'en';
  const count = u.searchParams.get('count') ?? '5';
  if (!q.trim()) return NextResponse.json({ results: [] });

  const api = new URL('https://geocoding-api.open-meteo.com/v1/search');
  api.searchParams.set('name', q);
  api.searchParams.set('count', count);
  api.searchParams.set('language', lang);
  api.searchParams.set('format', 'json');

  const r = await fetch(api, { next: { revalidate: 3600 } });
  return NextResponse.json(await r.json());
}
