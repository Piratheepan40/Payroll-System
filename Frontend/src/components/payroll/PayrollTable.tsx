import { useState, useMemo } from 'react';
import { Payroll, Worker } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
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
import { formatCurrency, getMonthName, getCurrentMonthYear, calculateSalary } from '@/lib/salary-utils';
import { Search, Download, FileText, Plus, CheckSquare, Layers } from 'lucide-react';
import { generateSalarySlipPDF, generateBulkSalarySlipsPDF } from '@/lib/pdf-generator';
import { exportPayrollToExcel } from '@/lib/excel-generator';
import { toast } from 'sonner';

interface PayrollTableProps {
  payrolls: Payroll[];
  workers: Worker[];
  onProcess: (workerId: string, paymentMethod: 'cash' | 'bank_transfer' | 'cheque', presentDays?: number, leaveDays?: number, otHours?: number, incentives?: number, otherDeductions?: number) => void;
  onBulkProcess: (payrollsData: any[]) => void;
}

export function PayrollTable({ payrolls, workers, onProcess, onBulkProcess }: PayrollTableProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(getMonthName(getCurrentMonthYear().month));
  const [selectedWorker, setSelectedWorker] = useState('');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'cash' | 'bank_transfer' | 'cheque'>('bank_transfer');
  const [showProcessForm, setShowProcessForm] = useState(false);
  const [presentDays, setPresentDays] = useState('');
  const [leaveDays, setLeaveDays] = useState('');
  const [otHours, setOtHours] = useState('');
  const [incentives, setIncentives] = useState('');
  const [deductions, setDeductions] = useState('');

  // Bulk Selection State
  const [selectedWorkerIds, setSelectedWorkerIds] = useState<Set<string>>(new Set());
  const [showBulkDialog, setShowBulkDialog] = useState(false);

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
        parseInt(leaveDays),
        parseFloat(otHours || '0'),
        parseFloat(incentives || '0'),
        parseFloat(deductions || '0')
      );
      setSelectedWorker('');
      setPresentDays('');
      setLeaveDays('');
      setOtHours('');
      setIncentives('');
      setDeductions('');
      setShowProcessForm(false);
    }
  };

  const handleExportExcel = () => {
    const { year } = getCurrentMonthYear();
    exportPayrollToExcel(filteredPayrolls, selectedMonth, year);
  };

  // Bulk Handlers
  const toggleSelectWorker = (workerId: string) => {
    const newSelected = new Set(selectedWorkerIds);
    if (newSelected.has(workerId)) {
      newSelected.delete(workerId);
    } else {
      newSelected.add(workerId);
    }
    setSelectedWorkerIds(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedWorkerIds.size === unpaidWorkers.length && unpaidWorkers.length > 0) {
      setSelectedWorkerIds(new Set());
    } else {
      setSelectedWorkerIds(new Set(unpaidWorkers.map(w => w.id)));
    }
  };

  const handleBulkSubmit = () => {
    const { year } = getCurrentMonthYear();

    // Check if we have selected workers
    if (selectedWorkerIds.size === 0) {
      toast.error("Please select at least one worker.");
      return;
    }

    const payload = Array.from(selectedWorkerIds).map(workerId => {
      const worker = workers.find(w => w.id === workerId);
      if (!worker) return null;

      // Calculate Default (Full Month)
      const calc = calculateSalary(worker.basic_salary, 30, 0); // Assuming 30 days present, 0 leave for bulk default

      return {
        worker_id: worker.id,
        worker_name: worker.full_name,
        worker_position: worker.job_position,
        worker_nic: worker.nic_no,
        month: selectedMonth,
        year,
        basic_salary: calc.basic_salary,
        epf_employee: calc.epf_employee,
        etf_employer: calc.etf_employer,
        net_salary: calc.net_salary,
        payment_method: selectedPaymentMethod,
        paid_date: new Date().toISOString().split('T')[0],
        paid_status: 'paid',
        present_days: 30, // Defaulting
        leave_days: 0,    // Defaulting
      };
    }).filter(p => p !== null);

    onBulkProcess(payload);
    setSelectedWorkerIds(new Set());
    setShowBulkDialog(false);
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
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <Button variant="outline" onClick={handleExportExcel} className="w-full sm:w-auto">
            <Download className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Export </span>Excel
          </Button>
          <Button variant="outline" onClick={() => generateBulkSalarySlipsPDF(filteredPayrolls)} disabled={filteredPayrolls.length === 0} className="w-full sm:w-auto">
            <span className="mr-2">📄</span>
            <span className="hidden sm:inline">Download </span>PDFs
          </Button>

          {selectedWorkerIds.size > 0 ? (
            <Button
              onClick={() => setShowBulkDialog(true)}
              className="bg-primary hover:bg-primary/90 w-full sm:w-auto"
            >
              <Layers className="h-4 w-4 mr-2" />
              Process Selected ({selectedWorkerIds.size})
            </Button>
          ) : (
            <Button onClick={() => setShowProcessForm(!showProcessForm)} className="w-full sm:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              Process Single
            </Button>
          )}
        </div>
      </div>

      {/* Bulk Process Dialog (Inline simplified) */}
      {showBulkDialog && (
        <div className="p-4 rounded-xl border bg-primary/5 border-primary/20 space-y-4 animate-scale-in">
          <h3 className="font-semibold text-primary flex items-center gap-2">
            <Layers className="h-5 w-5" />
            Bulk Process Confirmation
          </h3>
          <p className="text-sm text-foreground/80">
            You are about to process payroll for <strong>{selectedWorkerIds.size}</strong> workers for <strong>{selectedMonth}</strong>.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Payment Method</label>
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
            </div>
            <div className="flex items-end gap-2">
              <Button onClick={handleBulkSubmit} className="flex-1">Confirm & Process</Button>
              <Button variant="outline" onClick={() => setShowBulkDialog(false)}>Cancel</Button>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            * This will calculate salaries based on full attendance (30 days). For custom attendance, please use Single Process.
          </p>
        </div>
      )}

      {/* Process Salary Form (Single) */}
      {showProcessForm && !showBulkDialog && (
        <div className="p-4 rounded-xl border bg-muted/30 space-y-4 animate-slide-up">
          <h3 className="font-semibold">Process Salary Payment</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
            <div className="grid grid-cols-2 gap-2 md:col-span-2 lg:col-span-1">
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
            <div className="grid grid-cols-3 gap-2 md:col-span-2 lg:col-span-3">
              <div className="space-y-1">
                <Input
                  type="number"
                  min="0"
                  placeholder="OT Hours"
                  value={otHours}
                  onChange={(e) => setOtHours(e.target.value)}
                  className="bg-background"
                />
              </div>
              <div className="space-y-1">
                <Input
                  type="number"
                  min="0"
                  placeholder="Incentives"
                  value={incentives}
                  onChange={(e) => setIncentives(e.target.value)}
                  className="bg-background"
                />
              </div>
              <div className="space-y-1">
                <Input
                  type="number"
                  min="0"
                  placeholder="Deductions"
                  value={deductions}
                  onChange={(e) => setDeductions(e.target.value)}
                  className="bg-background"
                />
              </div>
            </div>

            <div className="flex gap-2 md:col-span-2 lg:col-span-3">
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

      {/* Unpaid Workers List (Bulk Selection Area) */}
      {unpaidWorkers.length > 0 && !showProcessForm && !showBulkDialog && (
        <div className="glass-card mb-6">
          <div className="p-4 border-b border-border/50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Checkbox
                checked={unpaidWorkers.length > 0 && selectedWorkerIds.size === unpaidWorkers.length}
                onCheckedChange={toggleSelectAll}
              />
              <h3 className="font-semibold text-lg">Pending Payments ({unpaidWorkers.length})</h3>
            </div>
            {selectedWorkerIds.size > 0 && (
              <span className="text-sm text-primary font-medium">{selectedWorkerIds.size} selected</span>
            )}
          </div>
          <div className="max-h-[300px] overflow-y-auto overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]"></TableHead>
                  <TableHead>Worker</TableHead>
                  <TableHead>Position</TableHead>
                  <TableHead>Basic Salary</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {unpaidWorkers.map(worker => (
                  <TableRow key={worker.id} className={selectedWorkerIds.has(worker.id) ? 'bg-primary/5' : ''}>
                    <TableCell>
                      <Checkbox
                        checked={selectedWorkerIds.has(worker.id)}
                        onCheckedChange={() => toggleSelectWorker(worker.id)}
                      />
                    </TableCell>
                    <TableCell className="font-medium">{worker.full_name}</TableCell>
                    <TableCell>{worker.job_position}</TableCell>
                    <TableCell>{formatCurrency(worker.basic_salary)}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm" variant="ghost" className="h-8 w-8 p-0"
                        onClick={() => {
                          setSelectedWorker(worker.id);
                          setShowProcessForm(true);
                        }}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {/* Processed Payrolls Table */}
      <h3 className="font-semibold text-lg mt-8 mb-4">Processed History</h3>
      <div className="rounded-xl border bg-card overflow-hidden">
        <div className="overflow-x-auto">
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
