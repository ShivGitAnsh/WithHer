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
    <main className="min-h-[calc(100vh-6rem)] w-full py-2 sm:py-4">
      <div
        className={cn(
          'dashboard-surface grid gap-6 lg:grid-cols-[290px_minmax(0,1fr)]',
          forHerEnabled && 'forher-mode'
        )}
      >
        {sidebar}
        <section className="min-w-0">{children}</section>
      </div>
    </main>
  );
}
