import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const u = new URL(req.url);
  const lat = u.searchParams.get('lat');
  const lon = u.searchParams.get('lon');
  const lang = u.searchParams.get('lang') ?? 'en';
  if (!lat || !lon) return NextResponse.json({ results: [] }, { status: 400 });

  const api = new URL('https://nominatim.openstreetmap.org/reverse');
  api.searchParams.set('lat', lat);
  api.searchParams.set('lon', lon);
  api.searchParams.set('lang', lang);
  api.searchParams.set('format', 'json');

  const r = await fetch(api, { next: { revalidate: 3600 } });
  return NextResponse.json(await r.json());
}
