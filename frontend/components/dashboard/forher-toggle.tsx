'use client';

import { ShieldCheck } from 'lucide-react';
import { useEffect, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { getForHerPreference, updateForHerPreference } from '@/lib/api';
import { cn } from '@/lib/utils';

interface ForHerToggleProps {
  userId?: string;
  onChange?: (enabled: boolean) => void;
  onError?: (message: string) => void;
}

export function ForHerToggle({
  userId,
  onChange,
  onError
}: ForHerToggleProps) {
  const [enabled, setEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    let isActive = true;

    const loadPreference = async () => {
      if (!userId) {
        if (isActive) {
          setEnabled(false);
          setIsLoading(false);
          onChange?.(false);
        }

        return;
      }

      try {
        const preference = await getForHerPreference(userId);

        if (!isActive) {
          return;
        }

        setEnabled(preference.enabled);
        onChange?.(preference.enabled);
      } catch {
        if (!isActive) {
          return;
        }

        setEnabled(false);
        onChange?.(false);
        onError?.('Unable to load ForHer preference right now.');
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    void loadPreference();

    return () => {
      isActive = false;
    };
  }, [onChange, onError, userId]);

  const handleToggle = async () => {
    if (!userId || isLoading || isUpdating) {
      return;
    }

    const nextEnabled = !enabled;
    setIsUpdating(true);

    try {
      const preference = await updateForHerPreference(userId, nextEnabled);
      setEnabled(preference.enabled);
      onChange?.(preference.enabled);
    } catch {
      onError?.('Unable to update ForHer mode right now.');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div
      className={cn(
        'flex flex-col gap-4 rounded-[1.75rem] border px-5 py-4 shadow-panel transition-all sm:flex-row sm:items-center sm:justify-between',
        enabled
          ? 'border-[rgba(0,140,255,0.18)] bg-[linear-gradient(135deg,rgba(255,255,255,0.98),rgba(244,249,255,0.98))]'
          : 'border-border bg-white/92'
      )}
    >
      <div className="space-y-1.5">
        <div className="flex flex-wrap items-center gap-3">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-secondary text-primary">
            <ShieldCheck className="h-4 w-4" />
          </span>
          <p className="text-sm font-semibold text-foreground">
            Travel with Confidence (ForHer)
          </p>
          <Badge
            variant={enabled ? 'secondary' : 'outline'}
            className={cn(
              'px-3 py-1',
              enabled
                ? 'bg-[rgba(0,140,255,0.12)] text-[hsl(var(--mmt-blue-deep))]'
                : 'border-border bg-white/70 text-muted-foreground'
            )}
          >
            {isLoading
              ? 'Loading...'
              : isUpdating
                ? 'Saving...'
                : enabled
                  ? 'ForHer On'
                  : 'ForHer Off'}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          {enabled
            ? 'A softer presentation is active with calmer accents and more supportive visual cues.'
            : 'Standard dashboard mode is active with a neutral travel safety view.'}
        </p>
      </div>

      <button
        type="button"
        role="switch"
        aria-checked={enabled}
        aria-label="Travel with Confidence (ForHer)"
        disabled={!userId || isLoading || isUpdating}
        onClick={handleToggle}
        className={cn(
          'relative inline-flex h-12 w-24 items-center rounded-full border transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-60',
          enabled
            ? 'border-[rgba(0,140,255,0.24)] bg-[linear-gradient(97deg,#ff7b42_0%,#0a58ca_42%,#008cff_100%)] shadow-float'
            : 'border-border bg-secondary'
        )}
      >
        <span className="sr-only">Travel with Confidence (ForHer)</span>
        <span
          className={cn(
            'absolute left-1.5 h-9 w-9 rounded-full bg-white shadow-md transition-transform',
            enabled ? 'translate-x-12' : 'translate-x-0'
          )}
        />
        <span
          className={cn(
            'flex w-full justify-between px-4 text-[11px] font-semibold uppercase tracking-[0.24em]',
            enabled ? 'text-white/90' : 'text-muted-foreground'
          )}
        >
          <span>Off</span>
          <span>On</span>
        </span>
      </button>
    </div>
  );
}
