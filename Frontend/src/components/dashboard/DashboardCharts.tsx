import { useRef, useEffect, useState } from 'react';
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
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7 mt-6">
            <div className="col-span-4 glass-card p-6">
                <h3 className="font-bold text-lg mb-1">Salary Payout Trend</h3>
                <p className="text-sm text-muted-foreground mb-6">Total net salary paid over the last 6 months</p>
                <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={salaryTrendData}>
                            <XAxis
                                dataKey="name"
                                stroke="#888888"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                            />
                            <YAxis
                                stroke="#888888"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(value) => `LKR ${value / 1000}k`}
                            />
                            <Tooltip
                                cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                                contentStyle={{
                                    borderRadius: '12px',
                                    border: 'none',
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                                }}
                            />
                            <Bar dataKey="total" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="col-span-3 glass-card p-6">
                <h3 className="font-bold text-lg mb-1">Workforce by Department</h3>
                <p className="text-sm text-muted-foreground mb-6">Distribution of active workers</p>
                <div className="h-[300px] flex items-center justify-center">
                    {departmentData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={departmentData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {departmentData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{
                                        borderRadius: '12px',
                                        border: 'none',
                                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                                    }}
                                />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="text-muted-foreground text-sm text-center">
                            No department data available.
                            <br />Add departments to workers to see this chart.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
