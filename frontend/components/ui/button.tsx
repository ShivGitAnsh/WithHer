import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-[1rem] text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-60',
  {
    variants: {
      variant: {
        default:
          'bg-[linear-gradient(90deg,#0b62f2,#1f85ff)] text-primary-foreground shadow-float hover:-translate-y-0.5 hover:brightness-[1.03]',
        outline:
          'border border-border bg-white text-foreground shadow-sm hover:border-slate-300 hover:bg-secondary',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-[#eaf2ff]',
        ghost: 'text-foreground hover:bg-secondary',
        destructive:
          'bg-[linear-gradient(90deg,#ff5c3a,#ff7b43)] text-white shadow-float hover:-translate-y-0.5 hover:brightness-[1.03]'
      },
      size: {
        default: 'h-11 px-4 py-2',
        sm: 'h-9 rounded-lg px-3',
        lg: 'h-12 rounded-[1rem] px-6',
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
