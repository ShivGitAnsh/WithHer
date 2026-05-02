'use client';

import { useEffect, useId, useState } from 'react';
import { AlertTriangle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function FloatingSosButton({
  onTrigger,
  isLoading = false
}: {
  onTrigger: () => Promise<void> | void;
  isLoading?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const titleId = useId();

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen]);

  const handleConfirm = async () => {
    await onTrigger();
    setIsOpen(false);
  };

  return (
    <>
      <div className="pointer-events-none fixed bottom-5 right-5 z-40 sm:bottom-6 sm:right-6">
        <Button
          variant="destructive"
          size="lg"
          className="pointer-events-auto h-14 rounded-full px-5 text-sm font-semibold shadow-float"
          onClick={() => setIsOpen(true)}
          disabled={isLoading}
          aria-haspopup="dialog"
          aria-expanded={isOpen}
        >
          <AlertTriangle className="mr-2 h-4 w-4" />
          <span className="hidden sm:inline">{isLoading ? 'Sending Alert...' : 'SOS Support'}</span>
          <span className="sm:hidden">{isLoading ? 'Sending...' : 'SOS'}</span>
        </Button>
      </div>

      {isOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/45 px-4 pb-4 pt-10 backdrop-blur-sm sm:items-center sm:p-6"
          role="presentation"
          onClick={() => !isLoading && setIsOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            className={cn(
              'w-full max-w-md rounded-[1.75rem] border border-[hsl(var(--danger))]/15 bg-white p-6 shadow-[0_24px_80px_rgba(15,23,42,0.18)]'
            )}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[hsl(var(--danger-surface))] text-[hsl(var(--danger))]">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div className="space-y-2">
                <h3 id={titleId} className="text-lg font-semibold text-plumInk">
                  Trigger SOS alert?
                </h3>
                <p className="text-sm leading-6 text-muted-foreground">
                  This will immediately create an SOS event and notify all guardians with
                  active consent for this trip on WhatsApp.
                </p>
              </div>
            </div>

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <Button
                variant="outline"
                onClick={() => setIsOpen(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleConfirm}
                disabled={isLoading}
              >
                {isLoading ? 'Sending alert...' : 'Confirm SOS'}
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
