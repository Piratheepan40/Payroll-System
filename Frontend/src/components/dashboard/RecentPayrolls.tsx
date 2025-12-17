import { Payroll } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/salary-utils';
import { Clock, User } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

interface RecentPayrollsProps {
  payrolls: Payroll[];
}

export function RecentPayrolls({ payrolls }: RecentPayrollsProps) {
  const recentPayrolls = payrolls.slice(0, 5);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .slice(0, 2)
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };

  return (
    <Card className="border-border/40 bg-card/50 backdrop-blur-sm shadow-sm">
      <CardHeader className="pb-3 pt-5">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          Recent Activity
        </CardTitle>
        <CardDescription className="text-xs">
          Latest processed payments
        </CardDescription>
      </CardHeader>
      <CardContent className="px-3 pb-3">
        {recentPayrolls.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
            <Clock className="h-8 w-8 mb-2 opacity-50" />
            <p className="text-xs">No recent activity</p>
          </div>
        ) : (
          <div className="space-y-1">
            {recentPayrolls.map((payroll, index) => (
              <div
                key={payroll.id}
                className={cn(
                  "flex items-center justify-between p-2.5 rounded-lg transition-colors hover:bg-muted/50",
                  index !== recentPayrolls.length - 1 && "border-b border-border/30"
                )}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Avatar className="h-8 w-8 border border-border/50">
                    <AvatarFallback className="text-[10px] bg-primary/5 text-primary">
                      {getInitials(payroll.worker?.full_name || payroll.worker_name || 'U')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="text-sm font-medium leading-none truncate mb-1">
                      {payroll.worker?.full_name || payroll.worker_name || 'Unknown'}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      {payroll.worker?.job_position || payroll.worker_position}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-sm font-semibold">
                    {formatCurrency(payroll.net_salary)}
                  </p>
                  <span className={cn(
                    "text-[10px] font-medium px-1.5 py-0.5 rounded-full inline-block mt-0.5",
                    payroll.paid_status === 'paid'
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                      : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                  )}>
                    {payroll.paid_status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
