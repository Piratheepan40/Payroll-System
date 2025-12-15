
import { Worker, Payroll } from '@/types';

export interface FraudAlert {
    detected: boolean;
    reason?: string;
    severity: 'high' | 'medium' | 'low';
}

export function detectWorkerFraud(newWorker: Partial<Worker>, existingWorkers: Worker[]): FraudAlert {
    // 1. Duplicate Bank Account
    if (newWorker.bank_account_no) {
        const duplicate = existingWorkers.find(
            w => w.bank_account_no === newWorker.bank_account_no && w.id !== newWorker.id
        );
        if (duplicate) {
            return {
                detected: true,
                reason: `Bank account ${newWorker.bank_account_no} is already used by ${duplicate.full_name}. This looks suspicious.`,
                severity: 'high'
            };
        }
    }

    // 2. Duplicate NIC
    if (newWorker.nic_no) {
        const duplicate = existingWorkers.find(
            w => w.nic_no === newWorker.nic_no && w.id !== newWorker.id
        );
        if (duplicate) {
            return {
                detected: true,
                reason: `NIC Number ${newWorker.nic_no} already exists for ${duplicate.full_name}.`,
                severity: 'high'
            };
        }
    }

    return { detected: false, severity: 'low' };
}

export function detectPayrollFraud(
    payrollData: any, // using Partial<Payroll> might be strict
    worker: Worker,
    previousPayrolls: Payroll[]
): FraudAlert {
    // 1. Duplicate Payment for same month
    const duplicate = previousPayrolls.find(
        p => p.worker_id === worker.id && p.month === payrollData.month && p.year === payrollData.year
    );
    if (duplicate) {
        return {
            detected: true,
            reason: `Payroll for ${worker.full_name} for ${payrollData.month} ${payrollData.year} already exists. Avoid double payment!`,
            severity: 'medium' // Block logic in AppContext
        };
    }

    // 2. OT Spike Detection (Advanced)
    // Check average OT of this worker for last 3 months
    const workerHistory = previousPayrolls
        .filter(p => p.worker_id === worker.id)
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()) // latest first
        .slice(0, 3);

    if (workerHistory.length > 0) {
        const totalOt = workerHistory.reduce((sum, p) => sum + (p.ot_hours || 0), 0);
        const avgOt = totalOt / workerHistory.length;

        // If current OT is > 2x average and > 5 hours, flag it
        if (payrollData.ot_hours > 5 && payrollData.ot_hours > (avgOt * 2)) {
            return {
                detected: true,
                reason: `Abnormal OT Spike detected! ${payrollData.ot_hours} hours is significantly higher than average (${avgOt.toFixed(1)} hrs).`,
                severity: 'medium'
            };
        }
    }

    return { detected: false, severity: 'low' };
}
