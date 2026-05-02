import type { ReactNode } from 'react';

import { SaraNavigation } from '@/components/sara/sara-navigation';

export function SaraAppShell({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-screen">
      <SaraNavigation />
      <main className="page-shell pb-16 pt-8 sm:pt-10">{children}</main>
    </div>
  );
}
