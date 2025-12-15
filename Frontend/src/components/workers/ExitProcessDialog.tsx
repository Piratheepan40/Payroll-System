
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Worker } from '@/types';
import { formatCurrency } from '@/lib/salary-utils';
import { AlertTriangle, FileText, Calculator } from 'lucide-react';

interface ExitProcessDialogProps {
    isOpen: boolean;
    onClose: () => void;
    worker: Worker | null;
    onConfirmExit: (workerId: string, data: any) => Promise<void>;
    onGenerateLetter: (worker: Worker) => void;
}

export function ExitProcessDialog({ isOpen, onClose, worker, onConfirmExit, onGenerateLetter }: ExitProcessDialogProps) {
    const [step, setStep] = useState(1);
    const [resignationDate, setResignationDate] = useState('');
    const [lastWorkingDate, setLastWorkingDate] = useState('');
    const [reason, setReason] = useState('');
    const [settlementAmount, setSettlementAmount] = useState(0);

    useEffect(() => {
        if (worker) {
            // Simple settlement calculation mock
            // In real app, this would query pending leaves, unpaid salary etc.
            const pendingDays = 5; // mocked pending days
            const dailyRate = worker.basic_salary / 30;
            const settlement = Math.round(dailyRate * pendingDays);
            setSettlementAmount(settlement);
        }
    }, [worker]);

    const handleConfirm = async () => {
        if (!worker) return;
        await onConfirmExit(worker.id, {
            status: 'resigned',
            resignation_date: resignationDate,
            last_working_date: lastWorkingDate,
            exit_reason: reason
        });
        setStep(3); // success step
    };

    if (!worker) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-destructive">
                        <AlertTriangle className="w-5 h-5" />
                        Employee Exit Process: {worker.full_name}
                    </DialogTitle>
                    <DialogDescription>
                        Manage resignation, final settlement context, and documentation.
                    </DialogDescription>
                </DialogHeader>

                {step === 1 && (
                    <div className="space-y-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Resignation Date</Label>
                                <Input type="date" value={resignationDate} onChange={e => setResignationDate(e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label>Last Working Day</Label>
                                <Input type="date" value={lastWorkingDate} onChange={e => setLastWorkingDate(e.target.value)} />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Reason for Exit</Label>
                            <Textarea placeholder="Enter reason..." value={reason} onChange={e => setReason(e.target.value)} />
                        </div>
                    </div>
                )}

                {step === 2 && (
                    <div className="space-y-6 py-4">
                        <div className="bg-muted p-4 rounded-lg space-y-3">
                            <h3 className="font-semibold flex items-center gap-2">
                                <Calculator className="w-4 h-4" /> Final Settlement Estimation
                            </h3>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                                <span className="text-muted-foreground">Basic Salary (Pending Days):</span>
                                <span className="font-mono text-right">{formatCurrency(settlementAmount)}</span>

                                <span className="text-muted-foreground">EPF Balance (Est.):</span>
                                <span className="font-mono text-right">{formatCurrency(worker.basic_salary * 0.08 * 12)}</span>

                                <div className="col-span-2 border-t pt-2 mt-2 flex justify-between font-bold">
                                    <span>Net Payable:</span>
                                    <span>{formatCurrency(settlementAmount)}</span>
                                </div>
                            </div>
                        </div>
                        <div className="text-sm text-yellow-600 bg-yellow-50 p-3 rounded border border-yellow-200">
                            Warning: This action will mark the employee as 'Resigned' and archive their active status.
                        </div>
                    </div>
                )}

                {step === 3 && (
                    <div className="py-8 text-center space-y-4">
                        <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
                            <FileText className="w-6 h-6" />
                        </div>
                        <h3 className="text-xl font-bold">Exit Processed Successfully</h3>
                        <p className="text-muted-foreground">Employee record updated. You can now download the experience letter.</p>
                        <Button variant="outline" onClick={() => onGenerateLetter(worker)} className="w-full">
                            <FileText className="w-4 h-4 mr-2" /> Download Experience Letter
                        </Button>
                    </div>
                )}

                <DialogFooter>
                    {step === 1 && (
                        <Button onClick={() => setStep(2)} disabled={!resignationDate || !lastWorkingDate}>Proceed to Settlement</Button>
                    )}
                    {step === 2 && (
                        <div className="flex gap-2 w-full justify-end">
                            <Button variant="ghost" onClick={() => setStep(1)}>Back</Button>
                            <Button variant="destructive" onClick={handleConfirm}>Confirm Exit</Button>
                        </div>
                    )}
                    {step === 3 && (
                        <Button onClick={onClose}>Close</Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
