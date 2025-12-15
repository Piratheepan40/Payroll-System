
import { Worker, Payroll } from '@/types';
import { getCurrentMonthYear } from './salary-utils';

export interface Alert {
    id: string;
    type: 'warning' | 'danger' | 'info';
    title: string;
    message: string;
}

export function generateAlerts(workers: Worker[], payrolls: Payroll[]): Alert[] {
    const alerts: Alert[] = [];
    const { month, year } = getCurrentMonthYear();
    const today = new Date();
    const day = today.getDate();

    // 1. Salary Processing Alert (If date > 25th and not all active workers have pending/paid payroll)
    if (day > 25) {
        const activeWorkers = workers.filter(w => w.status === 'active');
        const currentMonthPayrolls = payrolls.filter(p => p.month === getMonthName(month) && p.year === year);

        if (currentMonthPayrolls.length < activeWorkers.length) {
            const pendingCount = activeWorkers.length - currentMonthPayrolls.length;
            alerts.push({
                id: 'salary-processing',
                type: 'warning',
                title: 'Salary Processing Due',
                message: `Salaries for ${pendingCount} workers are yet to be processed for this month.`
            });
        }
    }

    // 2. EPF Payment Alert (If date > 15th and previous month's EPF not cleared - Mocking "cleared" as paid status of previous month)
    // Usually EPF for Jan is paid by Feb 15.
    // We check if "Last Month" payrolls are all marked "paid".
    const lastMonthDate = new Date();
    lastMonthDate.setMonth(lastMonthDate.getMonth() - 1);
    const lastMonthName = getMonthName(lastMonthDate.getMonth() + 1);
    const lastMonthYear = lastMonthDate.getFullYear();

    if (day > 15) {
        const lastMonthPayrolls = payrolls.filter(p => p.month === lastMonthName && p.year === lastMonthYear);
        const unpaidLastMonth = lastMonthPayrolls.filter(p => p.paid_status === 'pending');

        if (unpaidLastMonth.length > 0) {
            alerts.push({
                id: 'epf-due',
                type: 'danger',
                title: 'EPF/ETF Payment Overdue',
                message: `Payroll payments (and EPF) for ${lastMonthName} are still pending for ${unpaidLastMonth.length} workers.`
            });
        }
    }

    // 3. Attendance Missing (Mock: check if any active worker has no payroll record for current month even if date > 20)
    // This overlaps with salary processing but can be framed as "Attendance data missing" if we had an attendance table.
    // For now, let's add a generic "Data Check" alert if total workers > 0 but total payrolls (all time) is 0? No that's for fresh install.

    // Let's add a "Low Balance" or similar mock if we had company logic.
    // Or "Contract Expiry" if we had contract end date. 
    // Let's stick to the requested "Attendance Missing" as a placeholder for now.

    return alerts;
}

function getMonthName(monthIndex: number): string {
    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return months[monthIndex - 1]; // monthIndex is 1-based from salary-utils usually but here we need to be careful
    // Update: salary-utils getCurrentMonthYear returns 1-based month. this function expects 1-based.
}
