// app/layout.tsx
import './globals.css';
import type { Metadata } from 'next';
import { DM_Sans, Bricolage_Grotesque } from 'next/font/google';
import React from 'react';

export const metadata: Metadata = {
  title: 'Weather Now',
  description: 'FM30 Weather App',
};

// Body font (DM Sans) – weights per style guide
const fontSans = DM_Sans({
  subsets: ['latin'],
  weight: ['300', '500', '600', '700'],
  style: ['normal', 'italic'],
  display: 'swap',
  variable: '--font-sans',
});

// Display font (Bricolage Grotesque) – 700 per style guide
const fontDisplay = Bricolage_Grotesque({
  subsets: ['latin'],
  weight: ['700'],
  style: ['normal'],
  display: 'swap',
  variable: '--font-display',
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${fontSans.variable} ${fontDisplay.variable} bg-background font-sans antialiased`}
      >
        <div className="flex w-full justify-center overflow-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-neutral-600/50 lg:h-screen">
          <main className="w-full px-4 pb-10 pt-4 md:px-6 lg:max-w-6xl lg:py-8">{children}</main>
        </div>
      </body>
    </html>
  );
}
