import { SalaryCalculation } from '@/types';

export const EPF_RATE = 0.08; // 8%
export const ETF_RATE = 0.12; // 12%

export function calculateSalary(basicMonthlySalary: number, presentDays?: number, leaveDays?: number): SalaryCalculation {
  let finalBasicSalary = basicMonthlySalary;

  // If attendance is provided, prorate the salary
  if (presentDays !== undefined && leaveDays !== undefined) {
    const totalDays = presentDays + leaveDays;
    // Avoid division by zero
    if (totalDays > 0) {
      finalBasicSalary = (basicMonthlySalary / totalDays) * presentDays;
    } else {
      finalBasicSalary = 0;
    }
  }

  const epf_employee = Math.round(finalBasicSalary * EPF_RATE * 100) / 100;
  const etf_employer = Math.round(finalBasicSalary * ETF_RATE * 100) / 100;
  const net_salary = Math.round((finalBasicSalary - epf_employee) * 100) / 100;

  return {
    basic_salary: Math.round(finalBasicSalary * 100) / 100, // Return the EARNED basic, not the fixed monthly
    epf_employee,
    etf_employer,
    net_salary,
  };
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-LK', {
    style: 'currency',
    currency: 'LKR',
    minimumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('en-LK', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function getMonthName(month: number): string {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  return months[month - 1];
}

export function getCurrentMonthYear(): { month: number; year: number } {
  const now = new Date();
  return {
    month: now.getMonth() + 1,
    year: now.getFullYear(),
  };
}
