import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useApp } from '@/context/AppContext';
import { formatCurrency, getCurrentMonthYear, getMonthName } from '@/lib/salary-utils';
import { exportPayrollToExcel, exportWorkersToExcel } from '@/lib/excel-generator';
import { generateSalarySlipPDF } from '@/lib/pdf-generator';
import { Download, FileText, Users, CreditCard, Calendar, TrendingUp, Sparkles, ArrowRight } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useState } from 'react';
import { toast } from 'sonner';

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

  const reportCards = [
    {
      title: 'Monthly Payroll Summary',
      description: `Export detailed payroll summary for ${selectedMonth} ${year} including EPF, ETF, and net salary breakdown.`,
      icon: CreditCard,
      color: 'primary',
      stats: [
        { label: 'Records', value: monthlyPayrolls.length },
        { label: 'Total Net', value: formatCurrency(monthlyPayrolls.reduce((s, p) => s + p.net_salary, 0)) },
      ],
      action: handleExportPayrollExcel,
      actionLabel: 'Export to Excel',
      variant: 'default' as const,
    },
    {
      title: 'Workers Directory',
      description: 'Complete list of all workers with their personal details, positions, and salary information.',
      icon: Users,
      color: 'accent',
      stats: [
        { label: 'Total Workers', value: workers.length },
        { label: 'Active', value: workers.filter(w => w.status === 'active').length },
      ],
      action: handleExportWorkersExcel,
      actionLabel: 'Export to Excel',
      variant: 'default' as const,
    },
    {
      title: 'Salary Slips (PDF)',
      description: `Generate individual PDF salary slips for all paid workers in ${selectedMonth} ${year}.`,
      icon: FileText,
      color: 'success',
      stats: [
        { label: 'Slips to Generate', value: monthlyPayrolls.filter(p => p.paid_status === 'paid').length },
        { label: 'Format', value: 'PDF' },
      ],
      action: handleExportAllSlips,
      actionLabel: 'Download All Slips',
      variant: 'secondary' as const,
    },
  ];

  return (
    <Layout title="Reports" subtitle="Generate and export financial reports">
      <div className="space-y-8">
        {/* Report Period Selector */}
        <Card className="border-dashed">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                  <Calendar className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">Report Period</p>
                  <p className="text-sm text-muted-foreground">Select month to generate reports</p>
                </div>
              </div>
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger className="w-48 h-11">
                  <SelectValue placeholder="Select month" />
                </SelectTrigger>
                <SelectContent>
                  {months.map((month) => (
                    <SelectItem key={month} value={month}>{month} {year}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Report Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reportCards.map((card, index) => (
            <Card 
              key={card.title} 
              className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className={`h-1 bg-gradient-to-r ${
                card.color === 'primary' ? 'from-primary to-info' :
                card.color === 'accent' ? 'from-accent to-success' :
                'from-success to-accent'
              }`} />
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3 text-lg">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                    card.color === 'primary' ? 'bg-primary/10 text-primary' :
                    card.color === 'accent' ? 'bg-accent/10 text-accent' :
                    'bg-success/10 text-success'
                  } group-hover:scale-110 transition-transform duration-300`}>
                    <card.icon className="h-5 w-5" />
                  </div>
                  {card.title}
                </CardTitle>
                <CardDescription className="mt-2">
                  {card.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {card.stats.map((stat) => (
                    <div key={stat.label} className="p-3 rounded-xl bg-muted/50">
                      <p className="text-xs text-muted-foreground">{stat.label}</p>
                      <p className="font-bold text-foreground mt-0.5">{stat.value}</p>
                    </div>
                  ))}
                </div>
                <Button 
                  onClick={card.action} 
                  className="w-full group/btn"
                  variant={card.variant}
                >
                  <Download className="h-4 w-4 mr-2" />
                  {card.actionLabel}
                  <ArrowRight className="h-4 w-4 ml-auto opacity-0 -translate-x-2 group-hover/btn:opacity-100 group-hover/btn:translate-x-0 transition-all" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Summary Statistics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary/10 to-accent/10">
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
              {selectedMonth} {year} Statistics
            </CardTitle>
            <CardDescription>
              Complete financial summary for the selected period
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Total Basic Salary', value: monthlyPayrolls.reduce((s, p) => s + p.basic_salary, 0), color: 'bg-muted/50 text-foreground' },
                { label: 'Total EPF (8%)', value: monthlyPayrolls.reduce((s, p) => s + p.epf_employee, 0), color: 'bg-warning/10 text-warning' },
                { label: 'Total ETF (12%)', value: monthlyPayrolls.reduce((s, p) => s + p.etf_employer, 0), color: 'bg-success/10 text-success' },
                { label: 'Total Net Salary', value: monthlyPayrolls.reduce((s, p) => s + p.net_salary, 0), color: 'bg-primary/10 text-primary' },
              ].map((stat, index) => (
                <div 
                  key={stat.label} 
                  className={`text-center p-5 rounded-2xl ${stat.color} animate-slide-up opacity-0`}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <p className="text-sm text-muted-foreground mb-2">{stat.label}</p>
                  <p className="text-xl lg:text-2xl font-bold">
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
