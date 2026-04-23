import { cn } from "@/lib/cn";
import { forwardRef, type InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, id, required, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label htmlFor={id} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {label}{required && <span className="text-rose-500 ml-0.5">*</span>}
          </label>
        )}
        <input
          id={id}
          required={required}
          ref={ref}
          className={cn(
            "w-full rounded-xl px-3.5 py-2.5 text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-600/50 focus:border-transparent",
            "backdrop-blur-sm",
            error
              ? "border border-red-300 bg-red-50/80 dark:border-red-500/50 dark:bg-red-900/20"
              : "border border-white/40 dark:border-white/10 bg-white/50 dark:bg-white/5 text-gray-900 dark:text-slate-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 hover:bg-white/70 dark:hover:bg-white/10",
            className
          )}
          {...props}
        />
        {error && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>}
      </div>
    );
  }
);
Input.displayName = "Input";
