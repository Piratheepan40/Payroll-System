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

const variantConfig = {
  default: {
    bg: 'bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800',
    iconBg: 'bg-slate-500/10',
    iconColor: 'text-slate-600 dark:text-slate-400',
    accentColor: 'bg-slate-500',
  },
  primary: {
    bg: 'bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900',
    iconBg: 'bg-primary/10',
    iconColor: 'text-primary',
    accentColor: 'bg-primary',
  },
  success: {
    bg: 'bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950 dark:to-emerald-900',
    iconBg: 'bg-success/10',
    iconColor: 'text-success',
    accentColor: 'bg-success',
  },
  warning: {
    bg: 'bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950 dark:to-amber-900',
    iconBg: 'bg-warning/10',
    iconColor: 'text-warning',
    accentColor: 'bg-warning',
  },
  accent: {
    bg: 'bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900',
    iconBg: 'bg-accent/10',
    iconColor: 'text-accent',
    accentColor: 'bg-accent',
  },
  info: {
    bg: 'bg-gradient-to-br from-cyan-50 to-cyan-100 dark:from-cyan-950 dark:to-cyan-900',
    iconBg: 'bg-info/10',
    iconColor: 'text-info',
    accentColor: 'bg-info',
  },
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
  const config = variantConfig[variant];

  return (
    <Card
      className={cn(
        'relative overflow-hidden border-0 shadow-sm hover:shadow-md transition-all duration-300 group',
        config.bg,
        className
      )}
    >
      {/* Accent bar */}
      <div className={cn('absolute top-0 left-0 right-0 h-1', config.accentColor)} />

      <div className="p-6">
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
              'flex h-14 w-14 items-center justify-center rounded-2xl transition-transform duration-300 group-hover:scale-110 shadow-sm',
              config.iconBg
            )}
          >
            <Icon className={cn('h-7 w-7', config.iconColor)} />
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
                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                    : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
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
    </Card>
  );
}
