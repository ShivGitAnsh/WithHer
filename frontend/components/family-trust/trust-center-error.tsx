'use client';

import { AlertTriangle, RefreshCcw } from 'lucide-react';

import { TrustCenterShell } from '@/components/family-trust/trust-center-shell';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export function TrustCenterError({
  title = 'Unable to load Family Trust Center',
  description = 'Please check the trip id and try again.',
  onRetry
}: {
  title?: string;
  description?: string;
  onRetry?: () => void;
}) {
  return (
    <TrustCenterShell>
      <Card className="card-surface mx-auto max-w-2xl">
        <CardContent className="flex flex-col items-start gap-5 p-8">
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[hsl(var(--danger-surface))] text-[hsl(var(--danger))]">
            <AlertTriangle className="h-5 w-5" />
          </span>
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold text-plumInk">{title}</h1>
            <p className="text-sm leading-7 text-muted-foreground">{description}</p>
          </div>
          {onRetry ? (
            <Button onClick={onRetry}>
              <RefreshCcw className="mr-2 h-4 w-4" />
              Retry
            </Button>
          ) : null}
        </CardContent>
      </Card>
    </TrustCenterShell>
  );
}
