import React from 'react';
import { cn } from '@/lib/utils';

// Simple Tailwind implementation to avoid dependency issues for now
const Progress = React.forwardRef(({ className, value, ...props }, ref) => (
    <div
        ref={ref}
        className={cn(
            "relative h-4 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800",
            className
        )}
        {...props}
    >
        <div
            className="h-full w-full flex-1 bg-cyan-600 transition-all dark:bg-cyan-500"
            style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
        />
    </div>
))
Progress.displayName = "Progress"

export { Progress }
