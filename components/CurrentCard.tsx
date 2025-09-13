import Image from 'next/image';
import { Card } from '@/components/ui/card';
import { iconFor, labelFor } from '@/lib/wmo';
import { fmtLongDate } from '@/lib/format';
import type { Place, Weather } from '@/types';
import { motion, useMotionValue, useSpring, useTransform, useIsPresent } from 'framer-motion';
import { useEffect } from 'react';

type Props = { place: Place; data: Weather };

export default function CurrentCard({ place, data }: Props) {
  const code = data.current.weather_code as number;
  const icon = iconFor(code);
  const temp = Math.round(data.current.temperature_2m);

  const location = place.country
    ? `${place.name}, ${place.country}`
    : [place.name, place.admin1].filter(Boolean).join(', ');

  // animated count-up
  const raw = useMotionValue(0);
  const spring = useSpring(raw, { stiffness: 120, damping: 20, mass: 0.6 });
  const rounded = useTransform(spring, (v) => Math.round(v));
  const isPresent = useIsPresent();
  useEffect(() => { raw.set(temp); }, [temp, raw]);

  return (
    <Card
      className="relative max-h-[286px] overflow-hidden border-none bg-gradient-to-br from-blue-500 to-blue-700 py-8 bg-animate animate-fade-in-up will-change-transform hover:scale-[1.005] transition-transform"
      style={{ animationDelay: '80ms' }}
    >
      {/* backgrounds */}
      <Image src="/assets/images/bg-today-small.svg" alt="" fill priority className="object-cover md:hidden" />
      <Image src="/assets/images/bg-today-large.svg" alt="" fill priority className="hidden object-cover md:block" />

      <div className="relative grid grid-cols-1 items-center gap-6 p-8 text-neutral-0 md:grid-cols-2 md:p-10">
        {/* Left */}
        <div className="space-y-1 text-center sm:text-start animate-fade-in-up" style={{ animationDelay: '120ms' }}>
          <div className="text-2xl font-semibold">{location}</div>
          <div className="text-neutral-200">{fmtLongDate(data.current.time)}</div>
        </div>

        {/* Right */}
        <div className="flex items-center justify-end gap-4 md:gap-6 animate-fade-in-up" style={{ animationDelay: '160ms' }}>
          <Image src={icon} alt={labelFor(code)} width={100} height={100} className="drop-shadow animate-float" />
          <div className="text-[110px] font-bold italic leading-none will-change-transform">
            <motion.span>{rounded}</motion.span>
            <span aria-hidden className="pl-2 align-top text-3xl md:text-6xl">°</span>
            <span className="sr-only">{data.current_units?.temperature_2m ?? 'degrees'}</span>
          </div>
        </div>
      </div>

      {/* soft reveal ring on mount */}
      <motion.span
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: isPresent ? 1 : 0, scale: isPresent ? 1 : 0.97 }}
        transition={{ duration: 0.6 }}
        className="pointer-events-none absolute inset-0 ring-1 ring-white/10"
      />
    </Card>
  );
}
