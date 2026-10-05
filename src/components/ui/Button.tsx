import React from 'react';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost' | 'gold';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  icon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', variant = 'primary', size = 'md', isLoading, disabled, icon, children, ...props }, ref) => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/50 disabled:pointer-events-none disabled:opacity-50 whitespace-nowrap cursor-pointer rounded-lg';

    const sizeStyles = {
      sm: 'h-8 px-3 text-xs gap-1.5',
      md: 'h-9 px-4 py-2 text-sm gap-2',
      lg: 'h-11 px-6 text-base gap-2.5',
    };

    const variantStyles = {
      primary:
        'bg-amber-600 hover:bg-amber-500 text-white shadow-sm font-semibold active:translate-y-px',
      gold:
        'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-neutral-950 font-semibold shadow-sm',
      secondary:
        'bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700/80',
      outline:
        'border border-neutral-700 bg-transparent hover:bg-neutral-800/80 text-neutral-300 hover:text-white',
      danger:
        'bg-rose-600/90 hover:bg-rose-600 text-white shadow-sm active:translate-y-px',
      ghost:
        'hover:bg-neutral-800 text-neutral-300 hover:text-white',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
        {...props}
      >
        {isLoading ? <Loader2 className="w-4 h-4 animate-spin shrink-0" /> : icon ? <span className="shrink-0">{icon}</span> : null}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
