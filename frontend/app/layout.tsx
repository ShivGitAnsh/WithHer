import type { Metadata } from 'next';

import { ForHerModeProvider } from '@/components/sara/forher-mode-provider';
import { SaraAppShell } from '@/components/sara/sara-app-shell';
import { ToastProvider } from '@/components/ui/toaster';
import { saraUserProfile } from '@/lib/product-data';
import '@/app/globals.css';

export const metadata: Metadata = {
  title: 'SARA | Safety-Aware Travel Assistant',
  description:
    'A travel-first companion for safer solo journeys, trusted guardian visibility, and confident trip planning.'
};

export default function RootLayout({
  children
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <ToastProvider>
          <ForHerModeProvider userId={saraUserProfile.id}>
            <SaraAppShell>{children}</SaraAppShell>
          </ForHerModeProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
