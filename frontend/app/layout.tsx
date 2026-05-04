import type { Metadata } from 'next';

import { ForHerModeProvider } from '@/components/sara/forher-mode-provider';
import { SaraAppShell } from '@/components/sara/sara-app-shell';
import { ToastProvider } from '@/components/ui/toaster';
import { getConfiguredUserId } from '@/lib/runtime-config';
import '@/app/globals.css';

export const metadata: Metadata = {
  title: 'mySaathi by MakeMyTrip | Travel Confidence Companion',
  description:
    'A MakeMyTrip-style travel confidence companion for safer solo journeys, trusted guardian visibility, and calmer trip planning.'
};

export default function RootLayout({
  children
}: Readonly<{ children: React.ReactNode }>) {
  const userId = getConfiguredUserId();

  return (
    <html lang="en">
      <body>
        <ToastProvider>
          <ForHerModeProvider userId={userId}>
            <SaraAppShell>{children}</SaraAppShell>
          </ForHerModeProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
