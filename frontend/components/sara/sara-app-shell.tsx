import type { ReactNode } from 'react';

import { SaraNavigation } from '@/components/sara/sara-navigation';

export function SaraAppShell({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-screen">
      <SaraNavigation />
      <main className="page-shell pb-20 pt-6 sm:pt-8">{children}</main>
    </div>
  );
}
