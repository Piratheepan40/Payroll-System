import { Payroll } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/salary-utils';
import { ArrowUpRight, Clock, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface RecentPayrollsProps {
  payrolls: Payroll[];
}

export function RecentPayrolls({ payrolls }: RecentPayrollsProps) {
  const recentPayrolls = payrolls.slice(0, 5);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  };

  return (
    <Card className="glass-card border-border/50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2.5 text-lg">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-success/10 text-success">
                <Clock className="h-5 w-5" />
              </div>
              <span>Recent Payrolls</span>
            </CardTitle>
            <CardDescription className="text-sm ml-11">
              Latest salary payments processed
            </CardDescription>
          </div>
          <Link to="/payroll">
            <Button variant="ghost" size="sm" className="text-primary hover:text-primary hover:bg-primary/10">
              View all
              <ArrowUpRight className="h-4 w-4 ml-1" />
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent className="pb-4">
        {recentPayrolls.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="rounded-full bg-muted p-4 mb-4">
              <User className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium text-muted-foreground">No payrolls yet</p>
            <p className="text-xs text-muted-foreground/70 mt-1">Process your first payroll to see it here</p>
          </div>
        ) : (
          <div className="space-y-1">
            {recentPayrolls.map((payroll, index) => (
              <div
                key={payroll.id}
                className="group flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-all duration-200 border border-transparent hover:border-border/50"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <Avatar className="h-11 w-11 border-2 border-background shadow-sm">
                    <AvatarFallback className="bg-gradient-to-br from-primary/20 to-accent/20 text-primary font-bold text-sm">
                      {getInitials(payroll.worker?.full_name || payroll.worker_name || 'U')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-foreground text-sm truncate group-hover:text-primary transition-colors">
                      {payroll.worker?.full_name || payroll.worker_name || 'Unknown Worker'}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {payroll.worker?.job_position || payroll.worker_position || 'Unknown Position'}
                    </p>
                  </div>
                </div>
                <div className="text-right flex-shrink-0 ml-3">
                  <p className="font-bold text-foreground text-sm mb-1">
                    {formatCurrency(payroll.net_salary)}
                  </p>
                  <Badge
                    variant="secondary"
                    className={
                      payroll.paid_status === 'paid'
                        ? 'bg-emerald-100/50 text-emerald-700 border-emerald-200/50 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800 text-xs font-semibold'
                        : 'bg-amber-100/50 text-amber-700 border-amber-200/50 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800 text-xs font-semibold'
                    }
                  >
                    {payroll.paid_status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
