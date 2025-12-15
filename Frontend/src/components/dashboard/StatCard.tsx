import { cn } from '@/lib/utils';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'accent' | 'info';
  className?: string;
}

const variantClasses = {
  default: 'stat-card',
  primary: 'stat-card stat-card-primary',
  success: 'stat-card stat-card-success',
  warning: 'stat-card stat-card-warning',
  accent: 'stat-card', // Fallback or add specific class if needed
  info: 'stat-card',
};

const iconVariantClasses = {
  default: 'bg-slate-500/10 text-slate-600 dark:text-slate-400',
  primary: 'bg-primary/10 text-primary',
  success: 'bg-success/10 text-success',
  warning: 'bg-warning/10 text-warning',
  accent: 'bg-accent/10 text-accent',
  info: 'bg-info/10 text-info',
};

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  variant = 'default',
  className,
}: StatCardProps) {
  return (
    <div
      className={cn(
        variantClasses[variant] || 'stat-card',
        className
      )}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-1">
            {title}
          </p>
          {subtitle && (
            <p className="text-xs text-muted-foreground/70">{subtitle}</p>
          )}
        </div>
        <div
          className={cn(
            'flex h-12 w-12 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110 shadow-sm',
            iconVariantClasses[variant]
          )}
        >
          <Icon className="h-6 w-6" />
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-3xl font-bold text-foreground tracking-tight">
          {value}
        </p>

        {trend && (
          <div className="flex items-center gap-2">
            <div
              className={cn(
                'inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold',
                trend.isPositive
                  ? 'bg-emerald-100/50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                  : 'bg-red-100/50 text-red-700 dark:bg-red-900/30 dark:text-red-400'
              )}
            >
              {trend.isPositive ? (
                <TrendingUp className="h-3 w-3" />
              ) : (
                <TrendingDown className="h-3 w-3" />
              )}
              {Math.abs(trend.value)}%
            </div>
            <span className="text-xs text-muted-foreground font-medium">vs last month</span>
          </div>
        )}
      </div>
    </div>
  );
}
