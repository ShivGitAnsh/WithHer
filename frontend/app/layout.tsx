import type { Metadata } from 'next';

import { ForHerModeProvider } from '@/components/sara/forher-mode-provider';
import { SaraAppShell } from '@/components/sara/sara-app-shell';
import { ToastProvider } from '@/components/ui/toaster';
import { getPreferredUserId } from '@/lib/api';
import '@/app/globals.css';

export const metadata: Metadata = {
  title: 'SARA | Safety-Aware Travel Assistant',
  description:
    'A travel-first companion for safer solo journeys, trusted guardian visibility, and confident trip planning.'
};

export default async function RootLayout({
  children
}: Readonly<{ children: React.ReactNode }>) {
  const userId = await getPreferredUserId();

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
