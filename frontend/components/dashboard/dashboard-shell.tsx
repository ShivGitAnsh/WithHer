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
    <main className="min-h-screen px-4 py-5 lg:px-8 lg:py-7">
      <div
        className={cn(
          'dashboard-surface mx-auto grid max-w-7xl gap-6 lg:grid-cols-[290px_minmax(0,1fr)]',
          forHerEnabled && 'forher-mode'
        )}
      >
        {sidebar}
        <section className="min-w-0">{children}</section>
      </div>
    </main>
  );
}
