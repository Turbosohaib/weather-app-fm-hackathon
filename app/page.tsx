'use client';

import Image from 'next/image';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import UnitsMenu, { Units } from '@/components/units-menu';
import SearchBar from '@/components/search-bar';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { iconFor } from '@/lib/wmo';
import { fmtDay, fmtTime } from '@/lib/format';
import CurrentCard from '@/components/CurrentCard';
import HourlyPanel from '@/components/HourlyPanel';
import { Place, Weather } from '@/types';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'; // ⟵ NEW
import SplitText from '@/components/SplitText';

/* ------------ Page ------------ */

export default function Page() {
  // mount Units menu into header
  useEffect(() => {
    const root = document.getElementById('units-slot');
    if (!root) return;
    const u = document.createElement('div');
    root.appendChild(u);
    return () => {
      root.removeChild(u);
    };
  }, []);

  const [units, setUnits] = useState<Units>({ tUnit: 'celsius', wUnit: 'kmh', pUnit: 'mm' });
  const [place, setPlace] = useState<Place | null>(null);
  const [data, setData] = useState<Weather | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dayIdx, setDayIdx] = useState<number>(0);
  const [searchInputOverride, setSearchInputOverride] = useState<string | undefined>(undefined);

  // track search UX
  const [searchAttempted, setSearchAttempted] = useState(false);
  const [noResults, setNoResults] = useState(false);

  // keep latest place without adding it to hook deps
  const placeRef = useRef<Place | null>(null);
  useEffect(() => {
    placeRef.current = place;
  }, [place]);

  const load = useCallback(
    async (lat: number, lon: number): Promise<void> => {
      setLoading(true);
      setError(null);
      try {
        const url = `/api/weather?lat=${lat}&lon=${lon}&tUnit=${units.tUnit}&wUnit=${units.wUnit}&pUnit=${units.pUnit}&days=7&tz=auto`;
        const r = await fetch(url);

        if (!r.ok) {
          let apiMsg = '';
          try {
            const body = await r.json();
            apiMsg = body?.error || body?.message || '';
          } catch {
            try {
              apiMsg = (await r.text())?.trim();
            } catch {}
          }
          throw new Error(apiMsg || `API error ${r.status}`);
        }

        const j = (await r.json()) as Weather;
        setData(j);
        setDayIdx(0);
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : 'API error');
        setData(null);
      } finally {
        setLoading(false);
      }
    },
    [units.tUnit, units.wUnit, units.pUnit],
  );

  // ---- current location helper ----
  const getCurrentLocation = useCallback(async () => {
    try {
      setLoading(true);
      const pos = await new Promise<GeolocationPosition>((res, rej) => {
        if (!('geolocation' in navigator)) return rej(new Error('Geolocation not available'));
        navigator.geolocation.getCurrentPosition(res, rej, {
          enableHighAccuracy: true,
          timeout: 10000,
        });
      });

      const { latitude, longitude } = pos.coords;
      const rg = await fetch(`/api/reverse-geocode?lat=${latitude}&lon=${longitude}&lang=en`);
      const rgJson = await rg.json();

      const placeLike: Place = {
        name:
          rgJson?.address?.city ||
          rgJson?.address?.town ||
          rgJson?.address?.village ||
          rgJson?.address?.suburb ||
          rgJson?.address?.quarter ||
          rgJson?.display_name ||
          'Current Location',
        admin1:
          rgJson?.address?.state || rgJson?.address?.state_district || rgJson?.address?.county || undefined,
        country: rgJson?.address?.country || undefined,
        latitude,
        longitude,
      };

      setSearchAttempted(true);
      setNoResults(false);
      setPlace(placeLike);
      setSearchInputOverride('Current Location');
      await load(latitude, longitude);
    } catch (e) {
      console.warn('Current location unavailable:', e);
      setLoading(false);
    }
  }, [load]);

  // On first load, try to use current location by default (silently)
  useEffect(() => {
    void getCurrentLocation();
  }, [getCurrentLocation]);

  // re-fetch when units change for the last selected place
  useEffect(() => {
    if (placeRef.current) void load(placeRef.current.latitude, placeRef.current.longitude);
  }, [load]);

  const handlePlace = async (p: Place) => {
    setSearchAttempted(true);
    setNoResults(false);
    setPlace(p);
    await load(p.latitude, p.longitude);
  };

  const dayOptions: string[] = useMemo(
    () => data?.daily?.time?.map((t) => new Date(t).toLocaleDateString([], { weekday: 'long' })) ?? [],
    [data],
  );

  // split hourly by selected day
  const hourlyForDay: { time: string; temp: number; code: number; units: string }[] = useMemo(() => {
    if (!data) return [];
    const dayISO = data.daily.time[dayIdx];
    return data.hourly.time
      .map((t, i) => ({ i, t, d: t.slice(0, 10) }))
      .filter((x) => x.d === dayISO)
      .map((x) => ({
        time: fmtTime(x.t),
        temp: data.hourly.temperature_2m[x.i],
        code: data.hourly.weather_code[x.i],
        units: data.hourly_units.temperature_2m,
      }));
  }, [data, dayIdx]);


  return (
    <div className="w-full">
      {/* ⭐ meteor sparkles background (very light) */}
      <div className="pointer-events-none fixed inset-0 -z-10 opacity-[.12]">
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff22_1px,transparent_1.5px)] [background-size:22px_22px] animate-star-pan" />
      </div>

      <header className="flex w-full items-center justify-between">
        <div className="flex w-36 items-center gap-3 sm:w-auto">
          <Image src="/assets/images/logo.svg" alt="Weather Now" width={200} height={200} />
        </div>
        <div>
          <UnitsMenu value={units} onChangeAction={setUnits} />
        </div>
      </header>

      {error ? (
        <ErrorState msg={error} onRetry={() => place && load(place.latitude, place.longitude)} />
      ) : (
        <div className="flex flex-col items-center justify-center">

          <SplitText
            text="How’s the sky looking today?"
            className="h1 mb-10 mt-5 max-w-[300px] sm:max-w-[350px] text-center lg:max-w-full"
            delay={100}
            duration={0.6}
            ease="power3.out"
            splitType="chars"
            from={{ opacity: 0, y: 40 }}
            to={{ opacity: 1, y: 0 }}
            threshold={0.1}
            rootMargin="-100px"
            textAlign="center"
            // onLetterAnimationComplete={handleAnimationComplete}
          />

          {/*<Typewriter text="How’s the sky looking today?"/>*/}

          <SearchBar
            onSelectAction={handlePlace}
            onUseCurrentLocationAction={getCurrentLocation}
            onNoResultsAction={() => {
              setSearchAttempted(true);
              setNoResults(true);
              setPlace(null);
              setData(null);
              setError(null);
            }}
            valueOverride={searchInputOverride}
          />

          {/* Loading / Error / Empty / No-Results */}
          {loading && <LoadingSkeleton />}

          {!loading && !error && searchAttempted && noResults && <NoResultsState />}

          {!loading && !error && place && data && (
            <>
              <section className="grid w-full grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
                <div className="flex flex-col justify-between gap-6">
                  <CurrentCard place={place} data={data} />

                  {/* Metrics (count-up) */}
                  <section className="grid grid-cols-2 gap-4 md:grid-cols-4">
                    <Metric title="Feels Like" value={data.current.apparent_temperature} unit="°" />
                    <Metric
                      title="Humidity"
                      value={data.current.relative_humidity_2m}
                      unit={data.current_units.relative_humidity_2m}
                    />
                    <Metric
                      title="Wind"
                      value={data.current.wind_speed_10m}
                      unit={data.current_units.wind_speed_10m}
                    />
                    <Metric
                      title="Precipitation"
                      value={data.current.precipitation}
                      unit={data.current_units.precipitation}
                    />
                  </section>

                  {/* Daily forecast with hover tilt + precip bar */}
                  <section className="space-y-3">
                    <h3 className="font-semibold">Daily forecast</h3>
                    <div className="grid grid-cols-3 gap-3 md:grid-cols-7">
                      {data.daily.time.map((d, i) => {
                        return (
                          <Card
                            key={d}
                            className="border-neutral-700 bg-neutral-800 px-2 py-2.5 text-center transform-gpu transition-transform will-change-transform hover:[transform:perspective(900px)_rotateX(3deg)_rotateY(-3deg)] animate-fade-in-up"
                            style={{ animationDelay: `${i * 30}ms` }}
                          >
                            <div>{fmtDay(d)}</div>
                            <div className="flex h-12 items-center justify-center">
                              <Image src={iconFor(data.daily.weather_code[i])} alt="" width={50} height={50} />
                            </div>
                            <div className="flex items-center justify-between text-sm text-neutral-200">
                              <div>
                                {Math.round(data.daily.temperature_2m_max[i])}
                                <span aria-hidden className="pl-1 align-top">°</span>
                              </div>
                              <div>
                                <span className="text-neutral-300">
                                  {Math.round(data.daily.temperature_2m_min[i])}
                                  <span aria-hidden className="pl-1 align-top">°</span>
                                </span>
                              </div>
                            </div>
                          </Card>
                        );
                      })}
                    </div>
                  </section>
                </div>

                <HourlyPanel
                  title="Hourly forecast"
                  dayOptions={dayOptions}
                  selected={dayIdx}
                  onChange={setDayIdx}
                  rows={hourlyForDay}
                />
              </section>
            </>
          )}
        </div>
      )}
    </div>
  );
}

/* ------------ Pieces ------------ */

function Metric({ title, value, unit }: { title: string; value: number; unit: string }) {
  // animated count-up
  const mv = useMotionValue(0);
  const spring = useSpring(mv, { stiffness: 120, damping: 18, mass: 0.6 });
  const rounded = useTransform(spring, (v) => Math.round(v));

  useEffect(() => {
    mv.set(value ?? 0);
  }, [value, mv]);

  return (
    <Card className="rounded-xl border border-neutral-700 bg-neutral-800 px-5 py-4 hover:scale-[1.01] transform-gpu transition-transform">
      <div className="text-neutral-300">{title}</div>
      <div className="pt-3 text-3xl font-thin text-neutral-100">
        <motion.span>{rounded}</motion.span>
        {['°', '%'].includes(unit) ? unit : ` ${unit}`}
      </div>
    </Card>
  );
}

function LoadingSkeleton() {
  return (
    <section className="grid w-full grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
      {/* LEFT COLUMN */}
      <div className="flex flex-col gap-6">
        {/* Big “today” card with dotted texture + loader */}
        <Card className="relative h-[285px] overflow-hidden rounded-2xl border border-neutral-700 bg-neutral-800 sm:h-[255px]">
          <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.12)_1px,transparent_1px)] opacity-20 [background-size:22px_22px]" />
          <div className="relative grid place-items-center py-16 text-xl">
            <div className="flex items-center gap-2 pb-2">
              <Skeleton className="h-3 w-3 animate-bounce rounded-full bg-neutral-200/90 [animation-delay:-0.2s]" />
              <Skeleton className="h-3 w-3 animate-bounce rounded-full bg-neutral-200/90 [animation-delay:-0.1s]" />
              <Skeleton className="h-3 w-3 animate-bounce rounded-full bg-neutral-200/90" />
            </div>
            <div>Loading...</div>
          </div>
        </Card>

        {/* Metrics row */}
        <section className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {['Feels Like', 'Humidity', 'Wind', 'Precipitation'].map((label) => (
            <Card
              key={label}
              className="rounded-xl border border-neutral-700 bg-neutral-800 px-5 py-3"
            >
              <div className="text-neutral-300">{label}</div>
              <div className="pt-3 text-3xl font-thin text-neutral-100">
                <div>--</div>
              </div>
            </Card>
          ))}
        </section>

        {/* Daily forecast skeleton */}
        <section className="space-y-3">
          <h3 className="font-semibold">Daily forecast</h3>
          <div className="grid grid-cols-3 gap-3 md:grid-cols-7">
            {Array.from({ length: 7 }).map((_, i) => (
              <Skeleton
                key={i}
                className="h-[163px] rounded-xl border border-neutral-700 bg-neutral-800"
              />
            ))}
          </div>
        </section>
      </div>

      {/* RIGHT COLUMN: Hourly panel skeleton */}
      <Card className="flex w-full flex-col gap-4 rounded-2xl border border-neutral-700 bg-neutral-800 py-2 pl-4 pr-0">
        <div className="flex items-center justify-between pr-4 pt-3">
          <div className="text-lg font-semibold">Hourly forecast</div>
          {/* day dropdown placeholder */}
          <div className="flex h-8 place-items-center items-center gap-2 rounded-md bg-[#3C3B5D] px-3 text-3xl font-thin text-neutral-100">
            <div className="">-</div>
            <Image
              src="/assets/images/icon-dropdown.svg"
              alt="icon-dropdown.svg"
              width={15}
              height={15}
            />
          </div>
        </div>

        {/* list items placeholders */}
        <div className="space-y-3.5 pr-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton
              key={i}
              className="h-[54.5px] rounded-lg border border-neutral-600 bg-neutral-700"
            />
          ))}
        </div>
      </Card>
    </section>
  );
}

function ErrorState({ msg, onRetry }: { msg: string; onRetry: () => void }) {
  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4 pt-24">
      <Image src="/assets/images/icon-error.svg" alt="" width={56} height={56} />
      <h2 className="font-display text-5xl font-bold">Something went wrong</h2>
      <p className="text-xl text-neutral-300">
        We couldn’t connect to the server ({msg}). Please try again in a few moment.
      </p>
      <button
        onClick={onRetry}
        className="rounded-lg border border-neutral-700 bg-neutral-800 px-4 py-2 text-xl hover:bg-neutral-700"
      >
        Retry
      </button>
    </div>
  );
}

function NoResultsState() {
  return (
    <div className="flex min-h-[20vh] justify-center">
      <p className="text-center text-2xl font-semibold text-neutral-100">No search result found!</p>
    </div>
  );
}
