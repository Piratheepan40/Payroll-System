import { Worker as WorkerType } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, formatDate, calculateSalary } from '@/lib/salary-utils';
import {
  User,
  Mail,
  Phone,
  MapPin,
  CreditCard,
  Calendar,
  Building2,
  X,
  Briefcase
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface WorkerProfileDialogProps {
  open: boolean;
  onClose: () => void;
  worker: WorkerType;
}

import { useState } from 'react'; // Added useState
import { useApp } from '@/context/AppContext'; // Added useApp
import { ExitProcessDialog } from './ExitProcessDialog'; // Added ExitProcessDialog
import { generateExperienceLetter } from '@/lib/pdf-generator'; // Added PDF generator

// ... existing imports ...

export function WorkerProfileDialog({ open, onClose, worker }: WorkerProfileDialogProps) {
  const { updateWorker } = useApp(); // Get updateWorker
  const [showExitDialog, setShowExitDialog] = useState(false);
  const salaryBreakdown = calculateSalary(worker.basic_salary);

  const handleExitConfirm = async (workerId: string, data: Partial<WorkerType>) => {
    await updateWorker(workerId, data);
    setShowExitDialog(false);
    onClose(); // Close profile after exit
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl w-[calc(100%-2rem)] sm:w-full max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-heading">Worker Profile</DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-primary/10 to-accent/10">
              <div className="flex items-center gap-4 flex-1">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground text-2xl font-bold">
                  {worker.full_name.charAt(0)}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-foreground">{worker.full_name}</h2>
                  <p className="text-muted-foreground">{worker.job_position}</p>
                  <Badge
                    className={worker.status === 'active' ? 'bg-success text-success-foreground mt-1' : 'mt-1'}
                  >
                    {worker.status}
                  </Badge>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 w-full sm:w-auto">
                {worker.status === 'active' && (
                  <Button variant="destructive" size="sm" onClick={() => setShowExitDialog(true)} className="flex-1 sm:flex-none">
                    Initiate Exit
                  </Button>
                )}
                {worker.status === 'resigned' && (
                  <Button variant="outline" size="sm" onClick={() => generateExperienceLetter(worker)} className="flex-1 sm:flex-none">
                    <Briefcase className="w-4 h-4 mr-2" /> Exp. Letter
                  </Button>
                )}
              </div>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <h3 className="font-semibold text-foreground flex items-center gap-2">
                  <User className="h-4 w-4 text-primary" />
                  Personal Information
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">NIC Number:</span>
                    <span className="font-mono">{worker.nic_no}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Gender:</span>
                    <span className="capitalize">{worker.gender}</span>
                  </div>
                  <div className="flex justify-between items-start">
                    <span className="text-muted-foreground">Email:</span>
                    <span className="text-right">{worker.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Mobile:</span>
                    <span>{worker.mobile}</span>
                  </div>
                  <div className="flex justify-between items-start">
                    <span className="text-muted-foreground">Address:</span>
                    <span className="text-right max-w-[180px]">{worker.address}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="font-semibold text-foreground flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-primary" />
                  Employment Details
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Joined Date:</span>
                    <span>{formatDate(worker.joined_date)}</span>
                  </div>
                  {worker.resignation_date && (
                    <div className="flex justify-between text-destructive">
                      <span className="font-medium">Resigned Date:</span>
                      <span>{formatDate(worker.resignation_date)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Bank Name:</span>
                    <span>{worker.bank_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Account No:</span>
                    <span className="font-mono">{worker.bank_account_no}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Salary Breakdown */}
            <div className="rounded-xl border p-4 space-y-3">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-primary" />
                Salary Breakdown
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="text-center p-3 rounded-lg bg-muted/50">
                  <p className="text-xs text-muted-foreground">Basic Salary</p>
                  <p className="text-lg font-bold text-foreground">
                    {formatCurrency(salaryBreakdown.basic_salary)}
                  </p>
                </div>
                <div className="text-center p-3 rounded-lg bg-warning/10">
                  <p className="text-xs text-muted-foreground">EPF (8%)</p>
                  <p className="text-lg font-bold text-warning">
                    -{formatCurrency(salaryBreakdown.epf_employee)}
                  </p>
                </div>
                <div className="text-center p-3 rounded-lg bg-success/10">
                  <p className="text-xs text-muted-foreground">ETF (12%)</p>
                  <p className="text-lg font-bold text-success">
                    {formatCurrency(salaryBreakdown.etf_employer)}
                  </p>
                </div>
                <div className="text-center p-3 rounded-lg bg-primary/10">
                  <p className="text-xs text-muted-foreground">Net Salary</p>
                  <p className="text-lg font-bold text-primary">
                    {formatCurrency(salaryBreakdown.net_salary)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <ExitProcessDialog
        isOpen={showExitDialog}
        onClose={() => setShowExitDialog(false)}
        worker={worker}
        onConfirmExit={handleExitConfirm}
        onGenerateLetter={generateExperienceLetter}
      />
    </>
  );
}
