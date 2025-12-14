import { useState } from 'react';
import { Payroll, Worker } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { formatCurrency, getMonthName, getCurrentMonthYear } from '@/lib/salary-utils';
import { Search, Download, FileText, Plus } from 'lucide-react';
import { generateSalarySlipPDF } from '@/lib/pdf-generator';
import { exportPayrollToExcel } from '@/lib/excel-generator';

interface PayrollTableProps {
  payrolls: Payroll[];
  workers: Worker[];
  onProcess: (workerId: string, paymentMethod: 'cash' | 'bank_transfer' | 'cheque', presentDays?: number, leaveDays?: number) => void;
}

export function PayrollTable({ payrolls, workers, onProcess }: PayrollTableProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(getMonthName(getCurrentMonthYear().month));
  const [selectedWorker, setSelectedWorker] = useState('');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'cash' | 'bank_transfer' | 'cheque'>('bank_transfer');
  const [showProcessForm, setShowProcessForm] = useState(false);
  const [presentDays, setPresentDays] = useState('');
  const [leaveDays, setLeaveDays] = useState('');

  const filteredPayrolls = payrolls.filter((payroll) => {
    const matchesSearch =
      (payroll.worker?.full_name || payroll.worker_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (payroll.worker?.job_position || payroll.worker_position || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesMonth = payroll.month === selectedMonth;
    return matchesSearch && matchesMonth;
  });

  const activeWorkers = workers.filter(w => w.status === 'active');
  const unpaidWorkers = activeWorkers.filter(
    w => !payrolls.some(p => p.worker_id === w.id && p.month === selectedMonth && p.paid_status === 'paid')
  );

  const handleProcessPayroll = () => {
    if (selectedWorker && presentDays && leaveDays) {
      onProcess(
        selectedWorker,
        selectedPaymentMethod,
        parseInt(presentDays),
        parseInt(leaveDays)
      );
      setSelectedWorker('');
      setPresentDays('');
      setLeaveDays('');
      setShowProcessForm(false);
    }
  };

  const handleExportExcel = () => {
    const { year } = getCurrentMonthYear();
    exportPayrollToExcel(filteredPayrolls, selectedMonth, year);
  };

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search payrolls..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-full sm:w-64"
            />
          </div>
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="Select month" />
            </SelectTrigger>
            <SelectContent>
              {months.map((month) => (
                <SelectItem key={month} value={month}>{month}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportExcel}>
            <Download className="h-4 w-4 mr-2" />
            Export Excel
          </Button>
          <Button onClick={() => setShowProcessForm(!showProcessForm)}>
            <Plus className="h-4 w-4 mr-2" />
            Process Salary
          </Button>
        </div>
      </div>

      {/* Process Salary Form */}
      {showProcessForm && (
        <div className="p-4 rounded-xl border bg-muted/30 space-y-4 animate-slide-up">
          <h3 className="font-semibold">Process Salary Payment</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Select value={selectedWorker} onValueChange={setSelectedWorker}>
              <SelectTrigger>
                <SelectValue placeholder="Select worker" />
              </SelectTrigger>
              <SelectContent>
                {unpaidWorkers.map((worker) => (
                  <SelectItem key={worker.id} value={worker.id}>
                    {worker.full_name} - {formatCurrency(worker.basic_salary)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedPaymentMethod} onValueChange={(v) => setSelectedPaymentMethod(v as typeof selectedPaymentMethod)}>
              <SelectTrigger>
                <SelectValue placeholder="Payment method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                <SelectItem value="cash">Cash</SelectItem>
                <SelectItem value="cheque">Cheque</SelectItem>
              </SelectContent>
            </Select>
            <div className="grid grid-cols-2 gap-4 col-span-1 sm:col-span-3 lg:col-span-1">
              <div className="space-y-1">
                <Input
                  type="number"
                  min="0"
                  max="31"
                  placeholder="Present Days"
                  value={presentDays}
                  onChange={(e) => setPresentDays(e.target.value)}
                  className="bg-background"
                />
              </div>
              <div className="space-y-1">
                <Input
                  type="number"
                  min="0"
                  max="31"
                  placeholder="Leave Days"
                  value={leaveDays}
                  onChange={(e) => setLeaveDays(e.target.value)}
                  className="bg-background"
                />
              </div>
            </div>

            <div className="flex gap-2 sm:col-span-3 lg:col-span-1">
              <Button onClick={handleProcessPayroll} disabled={!selectedWorker || !presentDays || !leaveDays} className="flex-1">
                Confirm Payment
              </Button>
              <Button variant="outline" onClick={() => setShowProcessForm(false)}>
                Cancel
              </Button>
            </div>
          </div>
          {unpaidWorkers.length === 0 && (
            <p className="text-sm text-muted-foreground">All active workers have been paid for {selectedMonth}.</p>
          )}
        </div>
      )}

      {/* Table */}
      <div className="rounded-xl border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="table-header">
              <TableHead>Worker</TableHead>
              <TableHead>Month</TableHead>
              <TableHead>Basic Salary</TableHead>
              <TableHead>EPF (8%)</TableHead>
              <TableHead>ETF (12%)</TableHead>
              <TableHead>Net Salary</TableHead>
              <TableHead>Payment</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPayrolls.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                  No payroll records found for {selectedMonth}
                </TableCell>
              </TableRow>
            ) : (
              filteredPayrolls.map((payroll) => (
                <TableRow key={payroll.id} className="table-row-hover">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold text-sm">
                        {(payroll.worker?.full_name || 'U').charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{payroll.worker?.full_name || 'Unknown Worker'}</p>
                        <p className="text-xs text-muted-foreground">{payroll.worker?.job_position || payroll.worker_position}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{payroll.month} {payroll.year}</TableCell>
                  <TableCell className="font-medium">{formatCurrency(payroll.basic_salary)}</TableCell>
                  <TableCell className="text-warning">{formatCurrency(payroll.epf_employee)}</TableCell>
                  <TableCell className="text-success">{formatCurrency(payroll.etf_employer)}</TableCell>
                  <TableCell className="font-bold text-primary">{formatCurrency(payroll.net_salary)}</TableCell>
                  <TableCell>
                    <span className="capitalize text-sm">{payroll.payment_method.replace('_', ' ')}</span>
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={payroll.paid_status === 'paid' ? 'bg-success text-success-foreground' : ''}
                    >
                      {payroll.paid_status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => generateSalarySlipPDF(payroll)}
                    >
                      <FileText className="h-4 w-4 mr-1" />
                      PDF
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-xl bg-muted/30">
        <div className="text-center">
          <p className="text-sm text-muted-foreground">Total Basic</p>
          <p className="text-lg font-bold">{formatCurrency(filteredPayrolls.reduce((s, p) => s + p.basic_salary, 0))}</p>
        </div>
        <div className="text-center">
          <p className="text-sm text-muted-foreground">Total EPF</p>
          <p className="text-lg font-bold text-warning">{formatCurrency(filteredPayrolls.reduce((s, p) => s + p.epf_employee, 0))}</p>
        </div>
        <div className="text-center">
          <p className="text-sm text-muted-foreground">Total ETF</p>
          <p className="text-lg font-bold text-success">{formatCurrency(filteredPayrolls.reduce((s, p) => s + p.etf_employer, 0))}</p>
        </div>
        <div className="text-center">
          <p className="text-sm text-muted-foreground">Total Net Paid</p>
          <p className="text-lg font-bold text-primary">{formatCurrency(filteredPayrolls.reduce((s, p) => s + p.net_salary, 0))}</p>
        </div>
      </div>
    </div>
  );
}
