import type { HTMLAttributes } from 'react';

import { cn } from '@/lib/utils';

export function Avatar({
  className,
  children
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full',
        className
      )}
    >
      {children}
    </div>
  );
}

export function AvatarFallback({
  className,
  children
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'flex h-full w-full items-center justify-center rounded-full',
        className
      )}
    >
      {children}
    </div>
  );
}
