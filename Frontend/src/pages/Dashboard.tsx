import { Layout } from '@/components/layout/Layout';
import { StatCard } from '@/components/dashboard/StatCard';
import { Skeleton } from '@/components/ui/skeleton';
import { DashboardCharts } from '@/components/dashboard/DashboardCharts';
import { RecentPayrolls } from '@/components/dashboard/RecentPayrolls';
import { useApp } from '@/context/AppContext';
import { formatCurrency } from '@/lib/salary-utils';
import { Users, UserCheck, Wallet, Download, FileText, Bell, Plus, ArrowRight, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { exportPayrollToExcel } from '@/lib/excel-generator';
import { getCurrentMonthYear, getMonthName } from '@/lib/salary-utils';
import { generateDashboardReportPDF } from '@/lib/pdf-generator';
import { Helmet } from 'react-helmet-async';
import { useState, useEffect } from 'react';
import { Alert as AlertType, generateAlerts } from '@/lib/alert-system';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function Dashboard() {
  const { stats, payrolls, user, workers, refreshStats } = useApp();
  const { month, year } = getCurrentMonthYear();
  const [alerts, setAlerts] = useState<AlertType[]>([]);
  const [showAlerts, setShowAlerts] = useState(true);

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

  const currentMonthName = getMonthName(month);

  return (
    <Layout
      title="Dashboard"
      subtitle={`Overview for ${currentMonthName} ${year}`}
    >
      <Helmet>
        <title>Dashboard - Kalvayal</title>
      </Helmet>

      <div className="space-y-6 animate-in fade-in duration-500">

        {/* Header Actions Area - 'Clever' Compact Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-card/40 p-4 rounded-xl border border-border/40 backdrop-blur-sm">
          <div>
            <h2 className="text-xl font-semibold tracking-tight">
              Hello, {user?.name?.split(' ')[0] || 'Admin'} 👋
            </h2>
            <p className="text-sm text-muted-foreground">
              Everything is running smoothly today.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleExportExcel} className="h-9 hidden sm:flex">
              <Download className="h-4 w-4 mr-2" />
              Excel
            </Button>
            <Button variant="outline" size="sm" onClick={handleGeneratePDF} className="h-9 hidden sm:flex">
              <FileText className="h-4 w-4 mr-2" />
              PDF
            </Button>
            {/* Mobile: Show dropdown for export actions */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild className="sm:hidden">
                <Button variant="outline" size="sm" className="h-9">
                  <Download className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleExportExcel}>
                  <Download className="h-4 w-4 mr-2" />
                  Export Excel
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleGeneratePDF}>
                  <FileText className="h-4 w-4 mr-2" />
                  Export PDF
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Link to="/workers?action=new">
              <Button size="sm" className="h-9 shadow-md bg-primary hover:bg-primary/90">
                <Plus className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Add Worker</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* Smart Alerts - Collapsible */}
        {alerts.length > 0 && (
          <div className="relative">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold flex items-center gap-2 text-muted-foreground">
                <Bell className="w-4 h-4" />
                Attention Needed
                <Badge variant="secondary" className="ml-1 h-5 px-1.5 min-w-5">{alerts.length}</Badge>
              </h3>
              <Button variant="ghost" size="sm" className="h-6 text-xs text-muted-foreground" onClick={() => setShowAlerts(!showAlerts)}>
                {showAlerts ? 'Hide' : 'Show'}
              </Button>
            </div>

            {showAlerts && (
              <div className="grid gap-3 mb-6">
                {alerts.slice(0, 3).map(alert => (
                  <Alert key={alert.id} className="bg-card/50 border-l-4 border-l-amber-500 border-y-border/40 border-r-border/40 py-3">
                    <div className="flex items-start gap-3">
                      <Zap className="h-4 w-4 text-amber-500 mt-1" />
                      <div className="flex-1">
                        <AlertTitle className="text-sm font-semibold mb-0.5">{alert.title}</AlertTitle>
                        <AlertDescription className="text-xs text-muted-foreground">{alert.message}</AlertDescription>
                      </div>
                    </div>
                  </Alert>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Unified Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.total_workers === undefined ? (
            Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-32 rounded-xl" />)
          ) : (
            <>
              <StatCard
                title="Total Workers"
                value={stats.total_workers}
                icon={Users}
                trend={{ value: 2, isPositive: true }}
              />
              <StatCard
                title="Active Now"
                value={stats.active_workers}
                subtitle={`${stats.total_workers - stats.active_workers} inactive`}
                icon={UserCheck}
              />
              <StatCard
                title="Payroll (Net)"
                value={formatCurrency(stats.total_net_salary_this_month)}
                subtitle="This Month"
                icon={Wallet}
              />
              <StatCard
                title="Pending Payouts"
                value={formatCurrency(stats.total_salary_this_month - stats.total_net_salary_this_month)} // Rough estimate logic for now
                subtitle="Estimated"
                icon={Zap}
              // Reusing Zap for now, could be Clock
              />
            </>
          )}
        </div>

        {/* Charts & Activity Split */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Main Chart Area */}
          <div className="xl:col-span-2 space-y-6">
            <DashboardCharts workers={workers} payrolls={payrolls} />
          </div>

          {/* Sidebar / Recent Activity */}
          <div className="xl:col-span-1 space-y-6">
            <RecentPayrolls payrolls={payrolls} />

            {/* Quick Links / Mini Tools */}
            <div className="bg-gradient-to-br from-primary/10 via-card to-card p-5 rounded-xl border border-primary/10 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <Zap className="w-24 h-24 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2 relative z-10">Quick Actions</h3>
              <div className="space-y-2 relative z-10">
                <Link to="/payroll" className="block">
                  <div className="group flex items-center justify-between p-3 bg-background/50 hover:bg-background rounded-lg border border-border/50 transition-all cursor-pointer">
                    <span className="text-sm font-medium">Process {currentMonthName} Payroll</span>
                    <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                </Link>
                <Link to="/reports" className="block">
                  <div className="group flex items-center justify-between p-3 bg-background/50 hover:bg-background rounded-lg border border-border/50 transition-all cursor-pointer">
                    <span className="text-sm font-medium">View Detailed Reports</span>
                    <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
