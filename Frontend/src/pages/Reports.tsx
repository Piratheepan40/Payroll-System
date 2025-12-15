
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useApp } from '@/context/AppContext';
import { formatCurrency, getCurrentMonthYear, getMonthName } from '@/lib/salary-utils';
import { exportPayrollToExcel, exportWorkersToExcel } from '@/lib/excel-generator';
import { generateSalarySlipPDF } from '@/lib/pdf-generator';
import { Download, FileText, Users, CreditCard, Calendar, TrendingUp } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useState } from 'react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export default function Reports() {
  const { payrolls, workers } = useApp();
  const { year } = getCurrentMonthYear();
  const [selectedMonth, setSelectedMonth] = useState(getMonthName(getCurrentMonthYear().month));

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const monthlyPayrolls = payrolls.filter(p => p.month === selectedMonth);

  const handleExportPayrollExcel = () => {
    exportPayrollToExcel(monthlyPayrolls, selectedMonth, year);
    toast.success('Payroll report exported successfully!');
  };

  const handleExportWorkersExcel = () => {
    exportWorkersToExcel(workers);
    toast.success('Workers directory exported successfully!');
  };

  const handleExportAllSlips = () => {
    const paidPayrolls = monthlyPayrolls.filter(p => p.paid_status === 'paid');
    if (paidPayrolls.length === 0) {
      toast.error('No paid payrolls found for this month');
      return;
    }
    paidPayrolls.forEach((payroll, index) => {
      setTimeout(() => {
        generateSalarySlipPDF(payroll);
      }, index * 500);
    });
    toast.success(`Generating ${paidPayrolls.length} salary slips...`);
  };

  const stats = [
    {
      label: 'Total Basic Salary',
      value: monthlyPayrolls.reduce((s, p) => s + p.basic_salary, 0),
      color: 'text-blue-500',
    },
    {
      label: 'EPF Contributions',
      value: monthlyPayrolls.reduce((s, p) => s + p.epf_employee, 0),
      color: 'text-orange-500',
    },
    {
      label: 'ETF Contributions',
      value: monthlyPayrolls.reduce((s, p) => s + p.etf_employer, 0),
      color: 'text-purple-500',
    },
    {
      label: 'Net Disbursed',
      value: monthlyPayrolls.reduce((s, p) => s + p.net_salary, 0),
      color: 'text-green-600',
      highlight: true
    },
  ];

  return (
    <Layout title="Reports" subtitle="Export data and view financial summaries">
      <div className="space-y-6 animate-in fade-in duration-500">

        {/* Header / Filter */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-card border rounded-lg p-4 shadow-sm">
          <div>
            <h2 className="text-lg font-semibold">Report Period</h2>
            <p className="text-sm text-muted-foreground">Select the month to generate reports for</p>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select month" />
              </SelectTrigger>
              <SelectContent>
                {months.map((month) => (
                  <SelectItem key={month} value={month}>{month} {year}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Main Actions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-blue-600" />
                Payroll Data
              </CardTitle>
              <CardDescription>Export detailed payroll records</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <div className="text-2xl font-bold">{monthlyPayrolls.length}</div>
                <p className="text-xs text-muted-foreground">Records found</p>
              </div>
              <Button className="w-full" onClick={handleExportPayrollExcel}>
                <Download className="w-4 h-4 mr-2" /> Export to Excel
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="w-5 h-5 text-purple-600" />
                Worker Directory
              </CardTitle>
              <CardDescription>Full database of employees</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <div className="text-2xl font-bold">{workers.length}</div>
                <p className="text-xs text-muted-foreground">Total workers</p>
              </div>
              <Button className="w-full" variant="outline" onClick={handleExportWorkersExcel}>
                <Download className="w-4 h-4 mr-2" /> Export Directory
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="w-5 h-5 text-green-600" />
                Salary Slips
              </CardTitle>
              <CardDescription>Bulk generate PDF slips</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <div className="text-2xl font-bold">{monthlyPayrolls.filter(p => p.paid_status === 'paid').length}</div>
                <p className="text-xs text-muted-foreground">Paid slips ready</p>
              </div>
              <Button className="w-full" variant="secondary" onClick={handleExportAllSlips}>
                <Download className="w-4 h-4 mr-2" /> Download All PDFs
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Financial Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Monthly Financial Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {stats.map((stat) => (
                <div key={stat.label} className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                  <p className={cn(
                    "text-2xl font-bold font-mono",
                    stat.color,
                    stat.highlight && "text-3xl"
                  )}>
                    {formatCurrency(stat.value)}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

      </div>
    </Layout>
  );
}
