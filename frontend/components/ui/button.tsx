import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-2xl text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-60',
  {
    variants: {
      variant: {
        default:
          'border border-[#0f5ad1]/10 bg-[linear-gradient(97deg,#0a58ca_0%,#008cff_100%)] text-primary-foreground shadow-float hover:-translate-y-0.5 hover:brightness-105',
        outline:
          'border border-border bg-white/95 text-foreground shadow-sm hover:border-[#008cff]/25 hover:bg-[#f4f8ff]',
        secondary:
          'bg-[rgba(0,140,255,0.08)] text-[hsl(var(--mmt-blue-deep))] hover:bg-[rgba(0,140,255,0.14)]',
        ghost: 'text-foreground hover:bg-secondary',
        destructive:
          'border border-[rgba(235,32,38,0.1)] bg-[linear-gradient(97deg,#ff7b42_0%,#eb2026_100%)] text-white shadow-[0_14px_24px_rgba(235,32,38,0.2)] hover:-translate-y-0.5 hover:brightness-105'
      },
      size: {
        default: 'h-11 px-4 py-2',
        sm: 'h-9 rounded-lg px-3',
        lg: 'h-12 rounded-2xl px-6',
        icon: 'h-10 w-10'
      }
    },
    defaultVariants: {
      variant: 'default',
      size: 'default'
    }
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button
      className={cn(buttonVariants({ variant, size, className }))}
      ref={ref}
      {...props}
    />
  )
);
Button.displayName = 'Button';

export { Button, buttonVariants };
