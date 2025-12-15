import { Layout } from '@/components/layout/Layout';
import { StatCard } from '@/components/dashboard/StatCard';
import { Skeleton } from '@/components/ui/skeleton';
import { DashboardCharts } from '@/components/dashboard/DashboardCharts';
import { RecentPayrolls } from '@/components/dashboard/RecentPayrolls';
import { useApp } from '@/context/AppContext';
import { formatCurrency } from '@/lib/salary-utils';
import { Users, UserCheck, CreditCard, TrendingUp, Wallet, Building2, Download, FileText, Bell, AlertTriangle, AlertCircle, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { exportPayrollToExcel } from '@/lib/excel-generator';
import { getCurrentMonthYear, getMonthName } from '@/lib/salary-utils';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { generateDashboardReportPDF } from '@/lib/pdf-generator';
import { Helmet } from 'react-helmet-async';
import { useState, useEffect } from 'react';
import { Alert as AlertType, generateAlerts } from '@/lib/alert-system';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

export default function Dashboard() {
  const { stats, payrolls, monthlyData, user, workers, loading, refreshStats } = useApp();
  const { month, year } = getCurrentMonthYear();
  const [alerts, setAlerts] = useState<AlertType[]>([]);

  useEffect(() => {
    refreshStats();
  }, [refreshStats]);

  useEffect(() => {
    if (workers.length > 0) {
      setAlerts(generateAlerts(workers, payrolls));
    }
  }, [workers, payrolls]);

  const handleExportExcel = () => {
    exportPayrollToExcel(payrolls, getMonthName(month), year);
  };

  const handleGeneratePDF = () => {
    generateDashboardReportPDF(stats, payrolls, getMonthName(month), year);
  };

  return (
    <Layout
      title="Dashboard"
      subtitle={`Financial overview for ${getMonthName(month)} ${year}`}
    >
      <Helmet>
        <title>Dashboard - Kalvayal</title>
        <meta name="description" content={`Financial overview for ${getMonthName(month)} ${year}`} />
      </Helmet>

      <div className="space-y-8 animate-in fade-in duration-500">

        {/* Smart Alerts Section */}
        {alerts.length > 0 && (
          <div className="space-y-3 mt-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Bell className="w-5 h-5 text-primary" /> Smart Alerts
            </h3>
            <div className="grid gap-3">
              {alerts.map(alert => (
                <Alert key={alert.id} variant={alert.type === 'danger' ? 'destructive' : 'default'} className={alert.type === 'warning' ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20' : ''}>
                  {alert.type === 'danger' && <AlertCircle className="h-4 w-4" />}
                  {alert.type === 'warning' && <AlertTriangle className="h-4 w-4 text-yellow-600" />}
                  {alert.type === 'info' && <Info className="h-4 w-4" />}
                  <AlertTitle>{alert.title}</AlertTitle>
                  <AlertDescription>{alert.message}</AlertDescription>
                </Alert>
              ))}
            </div>
          </div>
        )}

        {/* Welcome & Quick Actions Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8 mt-2">
          {/* Welcome Card */}
          <div className="lg:col-span-2 glass-card relative overflow-hidden p-8 flex flex-col justify-center">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

            <div className="relative z-10">
              <h2 className="text-3xl font-bold text-foreground mb-2 tracking-tight">
                Welcome back, {user?.name || 'Admin'}! 👋
              </h2>
              <p className="text-muted-foreground text-lg mb-6 max-w-xl">
                Here's your organization's financial overview for <span className="font-semibold text-primary">{getMonthName(month)} {year}</span>.
                You have <span className="font-semibold text-foreground">{stats.active_workers || 0} active workers</span>.
              </p>

              <div className="flex flex-wrap gap-3">
                <Button
                  onClick={handleExportExcel}
                  className="bg-card hover:bg-accent/5 text-foreground border border-border/50 shadow-sm"
                >
                  <Download className="h-4 w-4 mr-2 text-primary" />
                  Export Report
                </Button>
                <Button
                  onClick={handleGeneratePDF}
                  className="bg-card hover:bg-accent/5 text-foreground border border-border/50 shadow-sm"
                >
                  <FileText className="h-4 w-4 mr-2 text-primary" />
                  Generate PDF
                </Button>
              </div>
            </div>
          </div>

          {/* Quick Actions Card */}
          <div className="glass-card p-6 flex flex-col justify-center gap-4">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <div className="p-2 rounded-lg bg-warning/10 text-warning">
                <TrendingUp className="h-5 w-5" />
              </div>
              Quick Actions
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" className="h-20 flex flex-col items-center justify-center gap-2 border-border/50 hover:border-primary/50 hover:bg-primary/5 transition-all" asChild>
                <a href="/workers?action=new">
                  <Users className="h-6 w-6 text-primary" />
                  <span className="text-xs font-semibold">Add Worker</span>
                </a>
              </Button>
              <Button variant="outline" className="h-20 flex flex-col items-center justify-center gap-2 border-border/50 hover:border-success/50 hover:bg-success/5 transition-all" asChild>
                <a href="/payroll">
                  <Wallet className="h-6 w-6 text-success" />
                  <span className="text-xs font-semibold">Process Salary</span>
                </a>
              </Button>
            </div>
          </div>
        </div>

        {/* Key Metrics Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="h-8 w-1 bg-primary rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
              <h3 className="text-xl font-bold text-foreground tracking-tight">Key Metrics</h3>
            </div>
            <span className="text-xs font-medium px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
              Last updated: Just now
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {stats.total_workers === undefined ? (
              Array(3).fill(0).map((_, i) => (
                <div key={i} className="h-32 rounded-2xl border border-border/50 bg-card/50 p-6">
                  <Skeleton className="h-4 w-1/2 mb-4" />
                  <Skeleton className="h-8 w-1/3 mb-2" />
                  <Skeleton className="h-4 w-1/4" />
                </div>
              ))
            ) : (
              <>
                <StatCard
                  title="Total Workers"
                  value={stats.total_workers}
                  icon={Users}
                  variant="primary"
                />
                <StatCard
                  title="Active Workers"
                  value={stats.active_workers}
                  icon={UserCheck}
                  variant="success"
                  trend={{ value: 5, isPositive: true }}
                />
                <StatCard
                  title="Net Paid"
                  value={formatCurrency(stats.total_net_salary_this_month)}
                  subtitle="This month"
                  icon={Wallet}
                  variant="accent"
                />
              </>
            )}
          </div>
        </div>

        {/* Financial Breakdown Section */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-8 w-1 bg-success rounded-full shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
            <h3 className="text-xl font-bold text-foreground tracking-tight">Financial Breakdown</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {stats.total_salary_this_month === undefined ? (
              Array(3).fill(0).map((_, i) => (
                <div key={i} className="h-32 rounded-2xl border border-border/50 bg-card/50 p-6">
                  <Skeleton className="h-4 w-1/2 mb-4" />
                  <Skeleton className="h-8 w-1/3 mb-2" />
                  <Skeleton className="h-4 w-1/4" />
                </div>
              ))
            ) : (
              <>
                <StatCard
                  title="Basic Salary"
                  value={formatCurrency(stats.total_salary_this_month)}
                  subtitle="Gross payroll"
                  icon={CreditCard}
                  variant="info"
                />
                <StatCard
                  title="EPF (8%)"
                  value={formatCurrency(stats.total_epf_this_month)}
                  subtitle="Employee contribution"
                  icon={TrendingUp}
                  variant="warning"
                />
                <StatCard
                  title="ETF (12%)"
                  value={formatCurrency(stats.total_etf_this_month)}
                  subtitle="Employer contribution"
                  icon={Building2}
                  variant="success"
                />
              </>
            )}
          </div>
        </div>

        <Separator className="my-8 opacity-50" />

        {/* Analytics Section */}
        <div className="pb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-8 w-1 bg-accent rounded-full shadow-[0_0_10px_rgba(168,85,247,0.5)]" />
            <h3 className="text-xl font-bold text-foreground tracking-tight">Analytics & Activity</h3>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-1 gap-6">
            {stats.total_workers === undefined ? (
              <Skeleton className="h-[400px] w-full rounded-2xl" />
            ) : (
              <div className="space-y-6 col-span-full">
                <DashboardCharts workers={workers} payrolls={payrolls} />
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                  <div className="xl:col-span-3">
                    <RecentPayrolls payrolls={payrolls} />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
