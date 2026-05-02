import { cn } from '@/lib/utils';

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-3xl border border-white/70 bg-gradient-to-r from-white/90 via-slate-100 to-white/90 shadow-panel',
        className
      )}
    />
  );
}
