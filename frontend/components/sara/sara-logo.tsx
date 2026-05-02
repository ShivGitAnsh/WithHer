'use client';

import { cn } from '@/lib/utils';

export function SaraLogo({ className }: { className?: string }) {
  return (
    <div className={cn('inline-flex items-center gap-3', className)}>
      <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#0f766e_0%,#0f4c81_62%,#f9fafb_100%)] shadow-[0_12px_28px_rgba(15,118,110,0.22)]">
        <svg
          aria-hidden="true"
          viewBox="0 0 32 32"
          className="h-6 w-6 text-white"
          fill="none"
        >
          <path
            d="M16 4.75c-4.2 0-7.5 3.24-7.5 7.4 0 5.4 7.5 14.1 7.5 14.1s7.5-8.7 7.5-14.1c0-4.16-3.3-7.4-7.5-7.4Z"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
          <path
            d="M16 10.1 19 11.2v3.2c0 2.15-1.32 4.16-3 4.9-1.68-.74-3-2.75-3-4.9v-3.2l3-1.1Z"
            fill="currentColor"
          />
        </svg>
      </span>
      <div className="leading-none">
        <span className="block text-sm font-semibold uppercase tracking-[0.28em] text-slate-500">
          Safety-Aware
        </span>
        <span className="mt-1 block text-xl font-semibold tracking-tight text-slate-950">
          SARA
        </span>
      </div>
    </div>
  );
}
