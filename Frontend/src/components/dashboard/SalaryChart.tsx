import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Area, AreaChart, ComposedChart } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { MonthlyData } from '@/types';
import { formatCurrency } from '@/lib/salary-utils';
import { TrendingUp, BarChart3 } from 'lucide-react';

interface SalaryChartProps {
  data: MonthlyData[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-popover border border-border rounded-xl p-4 shadow-xl z-50">
        <p className="font-bold text-popover-foreground mb-3 text-sm border-b border-border pb-2">{label}</p>
        <div className="space-y-2">
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center justify-between gap-6 text-sm">
              <span className="flex items-center gap-2.5">
                <span
                  className="w-2.5 h-2.5 rounded-full shadow-sm"
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-muted-foreground font-medium">
                  {entry.name}
                </span>
              </span>
              <span className="font-bold font-mono text-popover-foreground">
                {formatCurrency(entry.value)}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

export function SalaryChart({ data }: SalaryChartProps) {
  return (
    <Card className="col-span-full xl:col-span-2 shadow-sm hover:shadow-md transition-shadow duration-300 border-border/50">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2.5 text-xl">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 text-primary ring-1 ring-primary/20">
                <BarChart3 className="h-5 w-5" />
              </div>
              <span>Pay Analytics</span>
            </CardTitle>
            <CardDescription className="text-sm font-medium text-muted-foreground ml-1">
              Monthly breakdown of Basic Salary vs Net Salary
            </CardDescription>
          </div>
          {/* Optional: Add a Year selector or legend here if simpler */}
        </div>
      </CardHeader>
      <CardContent className="pt-4 px-2 sm:px-6 pb-6">
        <div className="h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={data} margin={{ top: 20, right: 20, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="solidPrimary" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                </linearGradient>
                <linearGradient id="solidSuccess" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--success))" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="hsl(var(--success))" stopOpacity={0.4} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} vertical={false} />
              <XAxis
                dataKey="month"
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12, fontWeight: 600 }}
                axisLine={false}
                tickLine={false}
                dy={15}
              />
              <YAxis
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12, fontWeight: 500 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                dx={-10}
              />
              <Tooltip
                content={<CustomTooltip />}
                cursor={{ fill: 'hsl(var(--muted))', opacity: 0.2 }}
              />
              <Legend
                iconType="circle"
                iconSize={8}
                height={36}
                verticalAlign="top"
                align="right"
                wrapperStyle={{ paddingBottom: '20px', fontSize: '12px', fontWeight: 500 }}
              />

              {/* Using Area for Net Salary to show it as a baseline foundation */}
              <Area
                type="monotone"
                dataKey="net_salary"
                name="Net Paid"
                stroke="hsl(var(--success))"
                strokeWidth={3}
                fill="url(#solidSuccess)"
                activeDot={{ r: 6, strokeWidth: 0 }}
                animationDuration={1500}
              />

              {/* Using Bar for Total Basic Salary to show the potential/gross */}
              <Bar
                dataKey="total_salary"
                name="Basic Salary"
                fill="url(#solidPrimary)"
                barSize={20}
                radius={[4, 4, 4, 4]}
                animationDuration={1500}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
