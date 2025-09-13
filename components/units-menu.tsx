'use client';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { useState } from 'react';

export type Units = {
  tUnit: 'celsius' | 'fahrenheit';
  wUnit: 'kmh' | 'mph' | 'ms' | 'kn';
  pUnit: 'mm' | 'inch';
};

export default function UnitsMenu({
  value,
  onChangeAction,
}: {
  value: Units;
  onChangeAction: (v: Units) => void;
}) {
  const [open, setOpen] = useState(false);
  const toggle = (k: keyof Units, val: Units[keyof Units]) =>
    onChangeAction({ ...value, [k]: val });

  // shared classes for the selectable rows
  const row =
    // hide default left indicator, tile look, hover & checked styles, right check visibility
    'group relative flex items-center justify-between' +
    'rounded-lg px-4 py-3 text-base outline-none' +
    'border border-transparent bg-transparent ' +
    'data-[highlighted]:bg-neutral-700 rounded-lg data-[state=checked]:bg-neutral-700 ' +
    'data-[state=checked]:border-neutral-800 ' +
    '[&>span:nth-child(1)]:hidden';

  const RightCheck = ({ checked }: { checked: boolean }) => (
    <Image
      src="/assets/images/icon-checkmark.svg"
      alt=""
      width={18}
      height={18}
      className={`transition-opacity ${checked ? 'opacity-100' : 'opacity-0'} group-data-[highlighted]:opacity-100`}
    />
  );

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="secondary"
          className="gap-2 rounded-lg border border-neutral-700 bg-neutral-800 px-2 py-3 text-sm text-neutral-0 hover:bg-neutral-700 sm:px-4 sm:py-6 md:text-lg"
        >
          <Image src="/assets/images/icon-units.svg" width={20} height={20} alt="" />
          Units
          <Image src="/assets/images/icon-dropdown.svg" width={12} height={12} alt="" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        sideOffset={8}
        className="w-60 rounded-2xl space-y-1 border border-neutral-700 bg-neutral-800/95 p-2 text-neutral-0 shadow-xl backdrop-blur"
      >
        <DropdownMenuLabel className="px-2 pb-1 pt-2 text-base text-neutral-0">
          Switch to {value.tUnit === 'celsius' ? 'Imperial' : 'Metric'}
        </DropdownMenuLabel>

        <DropdownMenuSeparator className="my-2 bg-neutral-700/60" />

        {/* Temperature */}
        <DropdownMenuLabel className="px-2 pb-1 text-sm text-neutral-300">
          Temperature
        </DropdownMenuLabel>
        {(['celsius', 'fahrenheit'] as const).map((u) => {
          const checked = value.tUnit === u;
          return (
            <DropdownMenuCheckboxItem
              key={u}
              checked={checked}
              onCheckedChange={() => toggle('tUnit', u)}
              className={`${row} cursor-pointer`}
            >
              {/* label area (we hid the default indicator with CSS) */}
              <div>{u === 'celsius' ? 'Celsius (°C)' : 'Fahrenheit (°F)'}</div>
              <RightCheck checked={checked} />
            </DropdownMenuCheckboxItem>
          );
        })}

        <DropdownMenuSeparator className="my-2 bg-neutral-700/60" />

        {/* Wind */}
        <DropdownMenuLabel className="px-2 pb-1 text-sm text-neutral-300">
          Wind Speed
        </DropdownMenuLabel>
        {(['kmh', 'mph'] as const).map((u) => {
          const checked = value.wUnit === u;
          return (
            <DropdownMenuCheckboxItem
              key={u}
              checked={checked}
              onCheckedChange={() => toggle('wUnit', u)}
              className={`${row} cursor-pointer`}
            >
              <div>{u === 'kmh' ? 'km/h' : 'mph'}</div>
              <RightCheck checked={checked} />
            </DropdownMenuCheckboxItem>
          );
        })}

        <DropdownMenuSeparator className="my-2 bg-neutral-700/60" />

        {/* Precipitation */}
        <DropdownMenuLabel className="px-2 pb-1 text-sm text-neutral-300">
          Precipitation
        </DropdownMenuLabel>
        {(['mm', 'inch'] as const).map((u) => {
          const checked = value.pUnit === u;
          return (
            <DropdownMenuCheckboxItem
              key={u}
              checked={checked}
              onCheckedChange={() => toggle('pUnit', u)}
              className={`${row} cursor-pointer`}
            >
              <div>{u === 'mm' ? 'Millimeters (mm)' : 'Inches (in)'}</div>
              <RightCheck checked={checked} />
            </DropdownMenuCheckboxItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
