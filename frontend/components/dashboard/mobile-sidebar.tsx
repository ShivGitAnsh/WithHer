'use client';

import { useState } from 'react';
import { Menu } from 'lucide-react';

import { Button } from '@/components/ui/button';

export function MobileSidebar({
  children
}: {
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        variant="outline"
        className="mb-4 rounded-2xl border-border/80 bg-white/90 shadow-panel backdrop-blur"
        onClick={() => setOpen(true)}
      >
        <Menu className="mr-2 h-4 w-4" />
        Menu
      </Button>

      {open ? (
        <div className="fixed inset-0 z-50 bg-slate-950/20 p-4 backdrop-blur-sm">
          <div className="mx-auto max-w-sm">
            <div className="mb-3 flex justify-end">
              <Button
                variant="ghost"
                className="rounded-full bg-white/95 shadow-panel"
                onClick={() => setOpen(false)}
              >
                Close
              </Button>
            </div>
            <div onClick={() => setOpen(false)}>{children}</div>
          </div>
        </div>
      ) : null}
    </>
  );
}
