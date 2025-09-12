// components/CurrentCard.tsx
import Image from 'next/image';
import { Card } from '@/components/ui/card';
import { iconFor, labelFor } from '@/lib/wmo';
import { fmtLongDate } from '@/lib/format';
import type { Place, Weather } from '@/types';

type Props = { place: Place; data: Weather };

export default function CurrentCard({ place, data }: Props) {
  const code = data.current.weather_code as number;
  const icon = iconFor(code);
  const temp = Math.round(data.current.temperature_2m);

  const location = place.country
    ? `${place.name}, ${place.country}`
    : [place.name, place.admin1].filter(Boolean).join(', ');

  return (
    <Card className="relative max-h-[286px] overflow-hidden border-none bg-gradient-to-br from-blue-500 to-blue-700 py-8">
      {/* decorative background per breakpoint */}
      <Image src="/assets/images/bg-today-small.svg" alt="" fill priority className="object-cover md:hidden" />
      <Image src="/assets/images/bg-today-large.svg" alt="" fill priority className="hidden object-cover md:block" />

      <div className="relative grid grid-cols-1 items-center gap-6 p-8 text-neutral-0 md:grid-cols-2 md:p-10">
        {/* Left: location + date */}
        <div className="space-y-1 text-center sm:text-start">
          <div className="text-2xl font-semibold">{location}</div>
          <div className="text-neutral-200">{fmtLongDate(data.current.time)}</div>
        </div>

        {/* Right: icon + temp */}
        <div className="flex items-center justify-end gap-4 md:gap-6">
          <Image src={icon} alt={labelFor(code)} width={100} height={100} className="drop-shadow" />
          <div className="text-[110px] font-bold italic leading-none">
            {temp}
            <span aria-hidden className="pl-2 align-top text-3xl md:text-6xl">°</span>
            <span className="sr-only">{data.current_units?.temperature_2m ?? 'degrees'}</span>
          </div>
        </div>
      </div>
    </Card>
  );
}
