import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

export function DashboardShell({
  sidebar,
  children,
  forHerEnabled = false
}: {
  sidebar: ReactNode;
  children: ReactNode;
  forHerEnabled?: boolean;
}) {
  return (
    <main className="min-h-screen px-0 py-4 sm:py-5">
      <div
        className={cn(
          'dashboard-surface mx-auto grid max-w-[1440px] gap-6 px-4 sm:px-6 lg:grid-cols-[300px_minmax(0,1fr)] lg:px-8 xl:px-10',
          forHerEnabled && 'forher-mode'
        )}
      >
        {sidebar}
        <section className="min-w-0">{children}</section>
      </div>
    </main>
  );
}
