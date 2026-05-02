import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

export function TrustCenterShell({
  children,
  className
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <main className="min-h-[calc(100vh-6rem)] w-full py-2 sm:py-4">
      <div className={cn('dashboard-surface', className)}>
        {children}
      </div>
    </main>
  );
}
