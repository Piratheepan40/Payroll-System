import { Layout } from '@/components/layout/Layout';
import { StatCard } from '@/components/dashboard/StatCard';
import { Skeleton } from '@/components/ui/skeleton';
import { SalaryChart } from '@/components/dashboard/SalaryChart';
import { RecentPayrolls } from '@/components/dashboard/RecentPayrolls';
import { useApp } from '@/context/AppContext';
import { formatCurrency } from '@/lib/salary-utils';
import { Users, UserCheck, CreditCard, TrendingUp, Wallet, Building2, Download, Calendar, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { exportPayrollToExcel } from '@/lib/excel-generator';
import { getCurrentMonthYear, getMonthName } from '@/lib/salary-utils';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { generateDashboardReportPDF } from '@/lib/pdf-generator';
import { Helmet } from 'react-helmet-async';

export default function Dashboard() {
  const { stats, payrolls, monthlyData, user } = useApp();
  const { month, year } = getCurrentMonthYear();

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

      {/* Welcome Section */}
      <div className="mb-8">
        <Card className="border-0 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div className="space-y-1">
                <h2 className="text-2xl font-bold text-foreground">
                  Welcome back, {user?.name || 'Admin'}! 👋
                </h2>
                <p className="text-muted-foreground">
                  Here's your organization's financial overview for {getMonthName(month)} {year}
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button
                  variant="outline"
                  onClick={handleExportExcel}
                  className="shadow-sm hover:shadow-md transition-shadow"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export Report
                </Button>
                <Button
                  variant="default"
                  onClick={handleGeneratePDF}
                  className="shadow-sm hover:shadow-md transition-shadow"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Generate PDF
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Key Metrics Section */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-8 w-1 bg-primary rounded-full" />
          <h3 className="text-lg font-bold text-foreground">Key Metrics</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          {stats.total_workers === undefined ? (
            Array(3).fill(0).map((_, i) => (
              <div key={i} className="h-32 rounded-xl border bg-card p-6 shadow-sm">
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
          <div className="h-8 w-1 bg-success rounded-full" />
          <h3 className="text-lg font-bold text-foreground">Financial Breakdown</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {stats.total_salary_this_month === undefined ? (
            Array(3).fill(0).map((_, i) => (
              <div key={i} className="h-32 rounded-xl border bg-card p-6 shadow-sm">
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

      <Separator className="my-8" />

      {/* Analytics Section */}
      <div>
        <div className="flex items-center gap-3 mb-6">
          <div className="h-8 w-1 bg-accent rounded-full" />
          <h3 className="text-lg font-bold text-foreground">Analytics & Activity</h3>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {monthlyData.length === 0 && payrolls.length === 0 && stats.total_workers === undefined ? (
            <>
              <Skeleton className="h-[400px] w-full rounded-xl" />
              <Skeleton className="h-[400px] w-full rounded-xl" />
            </>
          ) : (
            <>
              <SalaryChart data={monthlyData} />
              <RecentPayrolls payrolls={payrolls} />
            </>
          )}
        </div>
      </div>
    </Layout>
  );
}
