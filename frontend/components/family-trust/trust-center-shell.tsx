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
    <main className="min-h-screen px-0 py-4 sm:py-5">
      <div className={cn('dashboard-surface mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8 xl:px-10', className)}>
        {children}
      </div>
    </main>
  );
}
