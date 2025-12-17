import { cn } from '@/lib/utils';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
  onClick?: () => void;
}

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  className,
  onClick
}: StatCardProps) {
  return (
    <Card
      onClick={onClick}
      className={cn(
        "group relative overflow-hidden transition-all duration-300 hover:shadow-md border-border/40 bg-card/50 backdrop-blur-sm",
        onClick && "cursor-pointer hover:border-primary/20",
        className
      )}
    >
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="p-2.5 rounded-xl bg-primary/5 text-primary ring-1 ring-primary/10 transition-colors group-hover:bg-primary/10">
            <Icon className="h-5 w-5" />
          </div>
          {trend && (
            <div className={cn(
              "flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full",
              trend.isPositive
                ? "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 dark:text-emerald-400"
                : "text-rose-600 bg-rose-50 dark:bg-rose-950/30 dark:text-rose-400"
            )}>
              {trend.isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              <span>{Math.abs(trend.value)}%</span>
            </div>
          )}
        </div>

        {/* Value & Title */}
        <div className="space-y-1">
          <h3 className="text-2xl font-bold tracking-tight text-foreground">
            {value}
          </h3>
          <p className="text-sm font-medium text-muted-foreground/80">
            {title}
          </p>
        </div>

        {/* Subtitle / Footer */}
        {subtitle && (
          <p className="mt-3 text-xs text-muted-foreground/60 font-medium">
            {subtitle}
          </p>
        )}

        {/* Decorative Gradient Blob */}
        <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-gradient-to-br from-primary/5 to-transparent rounded-full blur-2xl group-hover:from-primary/10 transition-colors" />
      </CardContent>
    </Card>
  );
}
