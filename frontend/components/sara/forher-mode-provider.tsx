'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode
} from 'react';
import { Sparkles } from 'lucide-react';

import { getForHerPreference, updateForHerPreference } from '@/lib/api';
import { cn } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';

interface ForHerModeContextValue {
  enabled: boolean;
  isLoading: boolean;
  isUpdating: boolean;
  toggle: () => Promise<void>;
}

const ForHerModeContext = createContext<ForHerModeContextValue | null>(null);

export function ForHerModeProvider({
  userId,
  children
}: {
  userId: string;
  children: ReactNode;
}) {
  const [enabled, setEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    let isMounted = true;

    const loadPreference = async () => {
      try {
        const preference = await getForHerPreference(userId);

        if (!isMounted) {
          return;
        }

        setEnabled(preference.enabled);
      } catch {
        if (!isMounted) {
          return;
        }

        setEnabled(false);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void loadPreference();

    return () => {
      isMounted = false;
    };
  }, [userId]);

  const toggle = useCallback(async () => {
    if (isLoading || isUpdating) {
      return;
    }

    const nextValue = !enabled;
    setIsUpdating(true);

    try {
      const preference = await updateForHerPreference(userId, nextValue);
      setEnabled(preference.enabled);
      toast({
        title: preference.enabled ? 'ForHer mode enabled' : 'ForHer mode disabled',
        description: preference.enabled
          ? 'The interface has shifted to a softer, more personal feel.'
          : 'The interface is back to the standard travel product tone.'
      });
    } catch {
      toast({
        title: 'ForHer preference unavailable',
        description: 'Unable to update ForHer mode right now.',
        variant: 'destructive'
      });
    } finally {
      setIsUpdating(false);
    }
  }, [enabled, isLoading, isUpdating, toast, userId]);

  const value = useMemo(
    () => ({
      enabled,
      isLoading,
      isUpdating,
      toggle
    }),
    [enabled, isLoading, isUpdating, toggle]
  );

  return (
    <ForHerModeContext.Provider value={value}>
      <div
        className={cn(
          'min-h-screen transition-[background-image,background-color,color] duration-500',
          enabled && 'forher-mode'
        )}
      >
        {children}
      </div>
    </ForHerModeContext.Provider>
  );
}

export function useForHerMode() {
  const context = useContext(ForHerModeContext);

  if (!context) {
    throw new Error('useForHerMode must be used within ForHerModeProvider');
  }

  return context;
}

export function ForHerModeSwitch({
  variant = 'compact'
}: {
  variant?: 'compact' | 'panel';
}) {
  const { enabled, isLoading, isUpdating, toggle } = useForHerMode();

  if (variant === 'panel') {
    return (
      <div
        className={cn(
          'flex flex-col gap-4 rounded-[1.6rem] border px-5 py-5 transition-all sm:flex-row sm:items-center sm:justify-between',
          enabled
            ? 'border-[rgba(255,107,154,0.22)] bg-[linear-gradient(135deg,rgba(255,255,255,0.96),rgba(255,244,248,0.9))]'
            : 'border-border/70 bg-slate-50/80'
        )}
      >
        <div className="space-y-1.5">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-slate-700 shadow-sm">
              <Sparkles className="h-4 w-4" />
            </span>
            <div>
              <p className="text-sm font-semibold text-slate-950">
                Travel with Confidence (ForHer)
              </p>
              <p className="text-sm text-slate-500">
                {enabled
                  ? 'Softened accents and warmer cues are active.'
                  : 'Standard SARA theme is currently active.'}
              </p>
            </div>
          </div>
        </div>
        <SwitchButton
          enabled={enabled}
          isLoading={isLoading}
          isUpdating={isUpdating}
          onToggle={toggle}
        />
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <div className="hidden text-right xl:block">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
          ForHer
        </p>
        <p className="text-sm text-slate-500">
          {isLoading ? 'Loading' : enabled ? 'On' : 'Off'}
        </p>
      </div>
      <SwitchButton
        enabled={enabled}
        isLoading={isLoading}
        isUpdating={isUpdating}
        onToggle={toggle}
        compact
      />
    </div>
  );
}

function SwitchButton({
  enabled,
  isLoading,
  isUpdating,
  onToggle,
  compact = false
}: {
  enabled: boolean;
  isLoading: boolean;
  isUpdating: boolean;
  onToggle: () => Promise<void>;
  compact?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={enabled}
      aria-label="Travel with Confidence (ForHer)"
      disabled={isLoading || isUpdating}
      onClick={() => void onToggle()}
      className={cn(
        'relative inline-flex items-center rounded-full border transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-60',
        compact ? 'h-11 w-20 px-3' : 'h-12 w-24 px-3.5',
        enabled
          ? 'border-[rgba(255,107,154,0.3)] bg-[linear-gradient(135deg,rgba(255,107,154,0.92),rgba(168,139,250,0.92))] shadow-float'
          : 'border-border/70 bg-white shadow-sm'
      )}
    >
      <span
        className={cn(
          'absolute left-1.5 rounded-full bg-white shadow-md transition-transform duration-300',
          compact ? 'h-8 w-8' : 'h-9 w-9',
          enabled ? (compact ? 'translate-x-8' : 'translate-x-10') : 'translate-x-0'
        )}
      />
      <span
        className={cn(
          'flex w-full justify-between text-[10px] font-semibold uppercase tracking-[0.22em]',
          enabled ? 'text-white/92' : 'text-slate-500'
        )}
      >
        <span>Off</span>
        <span>{isUpdating ? '...' : 'On'}</span>
      </span>
    </button>
  );
}
