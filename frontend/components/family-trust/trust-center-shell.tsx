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
    <main className="min-h-screen px-4 py-5 lg:px-8 lg:py-7">
      <div className={cn('dashboard-surface mx-auto max-w-7xl', className)}>
        {children}
      </div>
    </main>
  );
}
