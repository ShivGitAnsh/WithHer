'use client';

import { cn } from '@/lib/utils';

export function SaraLogo({ className }: { className?: string }) {
  return (
    <div className={cn('inline-flex items-center gap-3', className)}>
      <span className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-[1.1rem] bg-[linear-gradient(145deg,#fefefe_0%,#f5f8ff_42%,#ffeaf1_100%)] shadow-[0_12px_24px_rgba(58,91,151,0.14)] ring-1 ring-white/80">
        <span className="absolute inset-[5px] rounded-[0.9rem] bg-[linear-gradient(145deg,#1570ef_0%,#6f8cff_48%,#ff7aa2_100%)] opacity-95" />
        <svg
          aria-hidden="true"
          viewBox="0 0 32 32"
          className="relative z-10 h-6 w-6 text-white"
          fill="none"
        >
          <path
            d="M16 5.25c-4.33 0-7.75 3.29-7.75 7.56 0 5.45 7.75 13.93 7.75 13.93s7.75-8.48 7.75-13.93c0-4.27-3.42-7.56-7.75-7.56Z"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinejoin="round"
          />
          <path
            d="M16 11.15c1.22-1.56 4.2-.82 4.2 1.38 0 2.77-4.2 5.42-4.2 5.42s-4.2-2.65-4.2-5.42c0-2.2 2.98-2.94 4.2-1.38Z"
            fill="currentColor"
          />
          <circle cx="22.9" cy="9.1" r="1.55" fill="currentColor" opacity="0.9" />
          <circle cx="9.7" cy="22.2" r="1" fill="currentColor" opacity="0.55" />
        </svg>
      </span>
      <div className="leading-none">
        <span className="block text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-400">
          by MakeMyTrip
        </span>
        <span className="mt-1 block text-[1.35rem] font-bold tracking-tight text-slate-950">
          mySaathi
        </span>
      </div>
    </div>
  );
}
