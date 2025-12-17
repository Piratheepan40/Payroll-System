import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, PieChart, Pie, Cell } from "recharts";
import { Worker, Payroll } from "@/types";
import { getMonthName } from "@/lib/salary-utils";

interface DashboardChartsProps {
    workers: Worker[];
    payrolls: Payroll[];
}

export function DashboardCharts({ workers, payrolls }: DashboardChartsProps) {
    // 1. Department Distribution Data
    const departmentData = workers.reduce((acc, worker) => {
        const dept = worker.department || 'Unassigned';
        const existing = acc.find(item => item.name === dept);
        if (existing) {
            existing.value++;
        } else {
            acc.push({ name: dept, value: 1 });
        }
        return acc;
    }, [] as { name: string; value: number }[]);

    // Colors for Pie Chart
    const COLORS = ['#0ea5e9', '#22c55e', '#eab308', '#f97316', '#ef4444', '#8b5cf6', '#ec4899'];

    // 2. Salary Trend Data (Last 6 Months)
    const salaryTrendData = (() => {
        const today = new Date();
        const data = [];
        for (let i = 5; i >= 0; i--) {
            const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
            const monthName = getMonthName(date.getMonth() + 1);
            const year = date.getFullYear();
            const key = `${monthName} ${year}`;

            // Filter payrolls for this month/year
            const monthlyPayrolls = payrolls.filter(p =>
                p.month === monthName && p.year === year
            );

            const totalPayout = monthlyPayrolls.reduce((sum, p) => sum + Number(p.net_salary), 0);

            data.push({
                name: monthName.substring(0, 3), // Short month name
                fullDate: key,
                total: totalPayout
            });
        }
        return data;
    })();

    return (
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
            <Card className="col-span-1 md:col-span-2 lg:col-span-1 border-border/40 bg-card/50 backdrop-blur-sm shadow-sm">
                <CardHeader>
                    <CardTitle className="text-lg">Salary Payout Trend</CardTitle>
                    <CardDescription>Total net salary paid over the last 6 months</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="h-[250px] sm:h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={salaryTrendData} margin={{ top: 10, right: 5, left: -30, bottom: 0 }}>
                                <XAxis
                                    dataKey="name"
                                    stroke="#888888"
                                    fontSize={11}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <YAxis
                                    stroke="#888888"
                                    fontSize={11}
                                    tickLine={false}
                                    axisLine={false}
                                    tickFormatter={(value) => `${value / 1000}k`}
                                />
                                <Tooltip
                                    cursor={{ fill: 'transparent' }}
                                    contentStyle={{
                                        borderRadius: '8px',
                                        border: '1px solid hsl(var(--border))',
                                        backgroundColor: 'hsl(var(--popover))',
                                        color: 'hsl(var(--popover-foreground))',
                                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                                    }}
                                />
                                <Bar
                                    dataKey="total"
                                    fill="hsl(var(--primary))"
                                    radius={[4, 4, 0, 0]}
                                    barSize={40}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>

            <Card className="col-span-1 border-border/40 bg-card/50 backdrop-blur-sm shadow-sm">
                <CardHeader>
                    <CardTitle className="text-lg">Workforce Distribution</CardTitle>
                    <CardDescription>Active workers by department</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="h-[250px] sm:h-[300px] flex items-center justify-center">
                        {departmentData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={departmentData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={50}
                                        outerRadius={80}
                                        paddingAngle={4}
                                        dataKey="value"
                                        stroke="hsl(var(--card))"
                                        strokeWidth={2}
                                    >
                                        {departmentData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{
                                            borderRadius: '8px',
                                            border: '1px solid hsl(var(--border))',
                                            backgroundColor: 'hsl(var(--popover))',
                                            color: 'hsl(var(--popover-foreground))',
                                            padding: '8px'
                                        }}
                                        itemStyle={{ padding: 0 }}
                                    />
                                    <Legend
                                        verticalAlign="bottom"
                                        height={36}
                                        iconType="circle"
                                        formatter={(value) => <span className="text-xs text-muted-foreground">{value}</span>}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="text-muted-foreground text-sm text-center">
                                No department data available.
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
