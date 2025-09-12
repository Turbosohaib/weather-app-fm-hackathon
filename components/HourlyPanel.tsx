import { Card } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { ChevronDown } from 'lucide-react';
import Image from 'next/image';
import { iconFor } from '@/lib/wmo';
import React from 'react';

type Props = {
  title: string;
  dayOptions: string[];
  selected: number;
  onChange: (i: number) => void;
  rows: { time: string; temp: number; code: number; units: string }[];
};

export default function HourlyPanel({ title, dayOptions, selected, onChange, rows }: Props) {
  return (
    <Card className="group w-full gap-3 border-neutral-700 bg-neutral-800 py-4 pl-4 pr-0">
      <div className="flex items-center justify-between pr-4 pt-1">
        <div className="text-lg font-semibold">{title}</div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="flex h-8 gap-0 rounded-md bg-[#3C3B5D] text-sm text-neutral-200 hover:bg-[#4a4970]"
            >
              {dayOptions[selected]}
              <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            align="end"
            className="w-44 rounded-xl border border-neutral-700 bg-neutral-800 p-1 text-neutral-200 shadow-lg"
          >
            <DropdownMenuRadioGroup
              value={String(selected)}
              onValueChange={(v) => onChange(Number(v))}
            >
              {dayOptions.map((d, i) => (
                <DropdownMenuRadioItem
                  key={i}
                  value={String(i)}
                  className="cursor-pointer rounded-md data-[highlighted]:bg-neutral-700/60 data-[state=checked]:bg-neutral-700/60"
                >
                  {d}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <ul className="max-h-[550px] space-y-3.5 overflow-y-auto pr-4 [&::-webkit-scrollbar-thumb]:cursor-pointer [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-neutral-700 hover:[&::-webkit-scrollbar-thumb]:bg-neutral-600 [&::-webkit-scrollbar]:w-1">
        {rows.map((r, i) => (
          <li
            key={i}
            className="flex cursor-pointer items-center justify-between rounded-lg border border-neutral-600 bg-neutral-700 px-4 py-2 hover:bg-neutral-600"
          >
            <div className="flex items-center gap-3">
              <Image src={iconFor(r.code)} alt="" width={37} height={37} />
              <span>{r.time}</span>
            </div>
            <div className="text-neutral-200">
              {Math.round(r.temp)}
              <span aria-hidden className="pl-1 align-top">
                °
              </span>
            </div>
          </li>
        ))}
      </ul>
    </Card>
  );
}
