'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { Card } from '@/components/ui/card';

type Place = {
  id?: number;
  name: string;
  country?: string;
  admin1?: string;
  latitude: number;
  longitude: number;
  timezone?: string;
};

type Props = {
  onSelectAction: (p: Place) => void;
  onNoResultsAction?: () => void;
  /** Called when user chooses “Current location” */
  onUseCurrentLocationAction?: () => Promise<void> | void;
  valueOverride?: string;
};

export default function SearchBar({
                                    onSelectAction,
                                    onNoResultsAction,
                                    onUseCurrentLocationAction,
                                    valueOverride,
                                  }: Props) {
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<Place[]>([]);
  const [showCurrent, setShowCurrent] = useState(false);

  const debounceId = useRef<ReturnType<typeof setTimeout> | null>(null);
  const ignoreNextQuery = useRef(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const focused = useRef(false);
  const abortRef = useRef<AbortController | null>(null);
  const forceOpenRef = useRef(false);

  // keep latest callback in a ref so doSearch can be stable
  const onNoResultsRef = useRef(onNoResultsAction);
  useEffect(() => {
    onNoResultsRef.current = onNoResultsAction;
  }, [onNoResultsAction]);

  // Apply parent-provided text once when it changes (do not read `q` here)
  useEffect(() => {
    if (typeof valueOverride === 'string') {
      ignoreNextQuery.current = true; // don't trigger debounce cycle
      setQ(valueOverride);
      setOpen(false);
      setResults([]);
    }
  }, [valueOverride]);

  // ---- shared fetcher (stable) ----
  const doSearch = useCallback(async (term: string) => {
    const query = term.trim();

    if (!query) {
      setResults([]);
      if (focused.current || forceOpenRef.current) {
        setShowCurrent(true); // show “Current Location” even with empty query
        setOpen(true);
      }
      return;
    }

    abortRef.current?.abort();
    const ac = new AbortController();
    abortRef.current = ac;

    setLoading(true);

    try {
      const r = await fetch(`/api/geocode?q=${encodeURIComponent(query)}&lang=en`, {
        signal: ac.signal,
      });
      const j = await r.json();
      const items: Place[] = j?.results ?? [];
      setResults(items);

      if (items.length === 0) onNoResultsRef.current?.();

      if (focused.current || forceOpenRef.current) setOpen(true);
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
      forceOpenRef.current = false;
    }
  }, []);

  // Debounced search while typing
  useEffect(() => {
    if (ignoreNextQuery.current) {
      ignoreNextQuery.current = false;
      return;
    }
    if (debounceId.current) clearTimeout(debounceId.current);

    if (!q.trim()) {
      setResults([]);
      if (focused.current) {
        setShowCurrent(true);
        setOpen(true);
      } else {
        setShowCurrent(false);
        setOpen(false);
      }
      return;
    }

    debounceId.current = setTimeout(() => void doSearch(q), 300);

    return () => {
      if (debounceId.current) clearTimeout(debounceId.current);
      abortRef.current?.abort();
    };
  }, [q, doSearch]);

  const handleSelect = (p: Place) => {
    onSelectAction(p);
    const label = `${p.name}${p.admin1 ? `, ${p.admin1}` : ''}${p.country ? `, ${p.country}` : ''}`;
    ignoreNextQuery.current = true;
    setOpen(false);
    setResults([]);
    setQ(label);
    inputRef.current?.blur();
  };

  const handleUseCurrent = async () => {
    setOpen(false);
    setResults([]);
    setQ('Current Location'); // exact label
    inputRef.current?.blur();
    await onUseCurrentLocationAction?.();
  };

  return (
    <div className="relative mb-8 w-full">
      <div className="flex w-full flex-col items-center justify-center gap-3 text-xl sm:flex-row">
        <div className="relative w-full lg:max-w-[500px]">
          <span className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2">
            <Image src="/assets/images/icon-search.svg" alt="search" width={20} height={20} />
          </span>

          <input
            ref={inputRef}
            placeholder="Search for a place..."
            value={q}
            onFocus={() => {
              focused.current = true;
              setShowCurrent(true); // show “Current Location” on focus
              setOpen(true); // open dropdown immediately
            }}
            onBlur={() => {
              focused.current = false;
              setTimeout(() => {
                if (!forceOpenRef.current) {
                  setOpen(false);
                  setShowCurrent(false);
                }
              }, 100);
            }}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                forceOpenRef.current = true;
                void doSearch(q);
              }
            }}
            className="w-full rounded-lg border-neutral-700 bg-neutral-800 py-4 pl-14 pr-4 text-neutral-0 placeholder:text-xl placeholder:text-neutral-300"
          />

          {open && (
            <Card className="absolute z-20 mt-2 w-full border-neutral-700 bg-neutral-800/95 p-1.5">
              {loading ? (
                <div className="flex items-center gap-3 rounded-lg px-4 py-3 text-neutral-200">
                  <Image
                    src="/assets/images/icon-loading.svg"
                    alt="loading"
                    width={18}
                    height={18}
                    className="animate-spin"
                  />
                  <span>Search in progress</span>
                </div>
              ) : (
                <ul className="max-h-72 overflow-auto [&::-webkit-scrollbar-thumb]:cursor-pointer [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-neutral-700 hover:[&::-webkit-scrollbar-thumb]:bg-neutral-600 [&::-webkit-scrollbar]:w-2">
                  {/* Always-on “Current Location” row while focused/open */}
                  {showCurrent && (
                    <li>
                      <button
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={handleUseCurrent}
                        className="w-full rounded-lg px-4 py-3 text-left hover:bg-neutral-700"
                      >
                        📍 Current Location
                      </button>
                    </li>
                  )}
                  {results.map((p, i) => (
                    <li key={i}>
                      <button
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => handleSelect(p)}
                        className="w-full rounded-lg px-4 py-3 text-left hover:bg-neutral-700"
                      >
                        {p.name}
                        {p.admin1 ? `, ${p.admin1}` : ''}
                        {p.country ? `, ${p.country}` : ''}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          )}
        </div>

        <button
          onClick={() => {
            forceOpenRef.current = true;
            void doSearch(q);
          }}
          className="w-full rounded-lg bg-blue-500 px-6 py-4 hover:bg-blue-700 sm:w-fit"
        >
          Search
        </button>
      </div>
    </div>
  );
}
