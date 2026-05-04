'use client';

import type { ReactNode } from 'react';

import { Badge } from '@/components/ui/badge';

export function DataStatePanel({
  eyebrow,
  title,
  description,
  action
}: {
  eyebrow: string;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <section className="hero-panel rounded-[1.75rem] border border-[#dbe8f7] px-6 py-8 shadow-panel sm:px-8">
      <Badge variant="secondary">{eyebrow}</Badge>
      <h1 className="mt-4 text-3xl font-semibold text-slate-950 sm:text-4xl">{title}</h1>
      <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
        {description}
      </p>
      {action ? <div className="mt-6">{action}</div> : null}
    </section>
  );
}
