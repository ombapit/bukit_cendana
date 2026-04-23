import { cn } from "@/lib/cn";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "success" | "danger" | "warning" | "info" | "default";
}

export function Badge({ children, variant = "default" }: BadgeProps) {
  const variants = {
    success: "bg-emerald-100/80 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 ring-1 ring-emerald-500/20",
    danger: "bg-rose-100/80 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400 ring-1 ring-rose-500/20",
    warning: "bg-amber-100/80 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400 ring-1 ring-amber-500/20",
    info: "bg-red-100/80 text-red-700 dark:bg-red-500/20 dark:text-red-400 ring-1 ring-red-500/20",
    default: "bg-gray-100/80 text-gray-700 dark:bg-white/10 dark:text-gray-300 ring-1 ring-gray-500/10",
  };

  return (
    <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium backdrop-blur-sm", variants[variant])}>
      {children}
    </span>
  );
}
