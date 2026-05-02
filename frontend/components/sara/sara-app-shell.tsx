import type { ReactNode } from 'react';

import { SaraNavigation } from '@/components/sara/sara-navigation';

export function SaraAppShell({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-[18rem] bg-[radial-gradient(circle_at_top,rgba(51,184,255,0.22),transparent_42%)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-[14rem] bg-[linear-gradient(180deg,rgba(2,18,35,0.92)_0%,rgba(7,45,95,0.74)_55%,transparent_100%)]"
      />
      <div className="relative z-10">
        <SaraNavigation />
        <main className="page-shell w-full pb-16 pt-6 sm:pt-8 lg:pt-10">{children}</main>
      </div>
    </div>
  );
}
