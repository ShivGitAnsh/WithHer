'use client';

import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode
} from 'react';
import { X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type ToastItem = {
  id: number;
  title: string;
  description?: string;
  variant?: 'default' | 'destructive';
};

const ToastContext = createContext<{
  toast: (input: Omit<ToastItem, 'id'>) => void;
} | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);

  const value = useMemo(
    () => ({
      toast: (input: Omit<ToastItem, 'id'>) => {
        const id = Date.now() + Math.floor(Math.random() * 1000);
        setItems((current) => [...current, { ...input, id }]);
        setTimeout(() => {
          setItems((current) => current.filter((item) => item.id !== id));
        }, 3600);
      }
    }),
    []
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 top-4 z-[100] mx-auto flex max-w-md flex-col gap-3 px-4">
        {items.map((item) => (
          <div
            key={item.id}
            className={cn(
              'pointer-events-auto rounded-2xl border bg-white/95 px-4 py-4 shadow-panel backdrop-blur',
              item.variant === 'destructive'
                ? 'border-rose-200'
                : 'border-white/80'
            )}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-medium text-plumInk">{item.title}</p>
                {item.description ? (
                  <p className="mt-1 text-sm text-cocoa">{item.description}</p>
                ) : null}
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full"
                onClick={() =>
                  setItems((current) => current.filter((toast) => toast.id !== item.id))
                }
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function Toaster() {
  return null;
}

export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }

  return context;
}
