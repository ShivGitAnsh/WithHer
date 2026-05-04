import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-[rgba(11,98,242,0.12)] text-primary',
        secondary: 'bg-[rgba(11,98,242,0.08)] text-secondary-foreground',
        outline: 'border border-border bg-white text-foreground',
        success: 'bg-[hsl(var(--safe-surface))] text-[hsl(var(--safe))]',
        caution: 'bg-[hsl(var(--caution-surface))] text-[hsl(var(--caution))]',
        danger: 'bg-[hsl(var(--danger-surface))] text-[hsl(var(--danger))]'
      }
    },
    defaultVariants: {
      variant: 'default'
    }
  }
);

function Badge({
  className,
  variant,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof badgeVariants>) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
