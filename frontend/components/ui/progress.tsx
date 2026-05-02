import { cn } from '@/lib/utils';

export function Progress({
  value,
  className,
  variant = 'default'
}: {
  value: number;
  className?: string;
  variant?: 'default' | 'safe' | 'caution' | 'danger';
}) {
  const barClassName =
    variant === 'safe'
      ? 'bg-[hsl(var(--safe))]'
      : variant === 'caution'
        ? 'bg-[hsl(var(--caution))]'
        : variant === 'danger'
          ? 'bg-[hsl(var(--danger))]'
          : 'bg-primary';

  return (
    <div className={cn('relative h-2.5 w-full overflow-hidden rounded-full bg-secondary', className)}>
      <div
        className={cn('h-full rounded-full transition-all', barClassName)}
        style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
      />
    </div>
  );
}
