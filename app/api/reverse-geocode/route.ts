import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const u = new URL(req.url);
  const lat = u.searchParams.get('lat');
  const lon = u.searchParams.get('lon');
  const lang = u.searchParams.get('lang') ?? 'en';
  if (!lat || !lon) return NextResponse.json({ results: [] }, { status: 400 });

  const key = process.env.LOCATIONIQ_KEY;
  if (!key) {
    return NextResponse.json({ error: 'Missing LOCATIONIQ_KEY' }, { status: 500 });
  }

  const api = new URL('https://us1.locationiq.com/v1/reverse');
  api.searchParams.set('key', key);
  api.searchParams.set('lat', lat);
  api.searchParams.set('lon', lon);
  api.searchParams.set('format', 'json');
  api.searchParams.set('addressdetails', '1');
  // LocationIQ uses `accept-language`
  if (lang) api.searchParams.set('accept-language', lang);

  const r = await fetch(api, {
    next: { revalidate: 3600 }, // cache 1h (tweak as you like)
    // optional but nice: identify your app
    headers: { 'User-Agent': 'weather-app-fm (contact: you@example.com)' },
  });

  if (!r.ok) {
    return NextResponse.json({ error: `reverse-geocode ${r.status}` }, { status: r.status });
  }

  const j = await r.json();
  return NextResponse.json(j);
}
