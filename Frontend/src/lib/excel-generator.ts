import { Payroll } from '@/types';
import { formatCurrency } from './salary-utils';
import * as XLSX from 'xlsx';

export function exportPayrollToExcel(payrolls: Payroll[], month: string, year: number): void {
  // Prepare data for Excel
  const data = payrolls.map((p, index) => ({
    'S.No': index + 1,
    'Worker Name': p.worker?.full_name || p.worker_name || 'N/A',
    'Position': p.worker?.job_position || p.worker_position || 'N/A',
    'NIC': p.worker?.nic_no || p.worker_nic || 'N/A',
    'Basic Salary (LKR)': p.basic_salary,
    'EPF Deduction 8% (LKR)': p.epf_employee,
    'ETF Employer 12% (LKR)': p.etf_employer,
    'Net Salary (LKR)': p.net_salary,
    'Payment Method': p.payment_method.replace('_', ' ').toUpperCase(),
    'Paid Date': new Date(p.paid_date).toLocaleDateString('en-LK'),
    'Status': p.paid_status.toUpperCase(),
  }));

  // Calculate totals
  const totals = {
    'S.No': '',
    'Worker Name': 'TOTAL',
    'Position': '',
    'NIC': '',
    'Basic Salary (LKR)': payrolls.reduce((sum, p) => sum + p.basic_salary, 0),
    'EPF Deduction 8% (LKR)': payrolls.reduce((sum, p) => sum + p.epf_employee, 0),
    'ETF Employer 12% (LKR)': payrolls.reduce((sum, p) => sum + p.etf_employer, 0),
    'Net Salary (LKR)': payrolls.reduce((sum, p) => sum + p.net_salary, 0),
    'Payment Method': '',
    'Paid Date': '',
    'Status': '',
  };

  // Add empty row and totals
  const exportData = [...data, {}, totals];

  // Create workbook and worksheet
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(exportData);

  // Set column widths
  ws['!cols'] = [
    { wch: 5 },   // S.No
    { wch: 25 },  // Worker Name
    { wch: 20 },  // Position
    { wch: 15 },  // NIC
    { wch: 18 },  // Basic Salary
    { wch: 20 },  // EPF
    { wch: 22 },  // ETF
    { wch: 18 },  // Net Salary
    { wch: 15 },  // Payment Method
    { wch: 12 },  // Paid Date
    { wch: 10 },  // Status
  ];

  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(wb, ws, 'Payroll Summary');

  // Create summary sheet
  const summaryData = [
    ['Kalvayal Samugaseevaka Sangam'],
    ['Monthly Payroll Summary'],
    [`Period: ${month} ${year}`],
    [''],
    ['Summary', 'Amount (LKR)'],
    ['Total Workers', payrolls.length],
    ['Total Basic Salary', totals['Basic Salary (LKR)']],
    ['Total EPF Deduction (8%)', totals['EPF Deduction 8% (LKR)']],
    ['Total ETF Contribution (12%)', totals['ETF Employer 12% (LKR)']],
    ['Total Net Salary Paid', totals['Net Salary (LKR)']],
    [''],
    [`Generated on: ${new Date().toLocaleString('en-LK')}`],
  ];

  const summaryWs = XLSX.utils.aoa_to_sheet(summaryData);
  summaryWs['!cols'] = [{ wch: 30 }, { wch: 20 }];
  XLSX.utils.book_append_sheet(wb, summaryWs, 'Summary');

  // Save file
  XLSX.writeFile(wb, `Payroll_Summary_${month}_${year}.xlsx`);
}

export function exportWorkersToExcel(workers: import('@/types').Worker[]): void {
  const data = workers.map((w, index) => ({
    'S.No': index + 1,
    'Full Name': w.full_name,
    'Position': w.job_position,
    'NIC': w.nic_no,
    'Mobile': w.mobile,
    'Email': w.email,
    'Address': w.address,
    'Gender': w.gender.toUpperCase(),
    'Joined Date': new Date(w.joined_date).toLocaleDateString('en-LK'),
    'Basic Salary (LKR)': w.basic_salary,
    'Bank Name': w.bank_name,
    'Account No': w.bank_account_no,
    'Status': w.status.toUpperCase(),
  }));

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(data);

  ws['!cols'] = [
    { wch: 5 },   // S.No
    { wch: 25 },  // Full Name
    { wch: 20 },  // Position
    { wch: 15 },  // NIC
    { wch: 15 },  // Mobile
    { wch: 25 },  // Email
    { wch: 30 },  // Address
    { wch: 10 },  // Gender
    { wch: 12 },  // Joined Date
    { wch: 15 },  // Basic Salary
    { wch: 18 },  // Bank Name
    { wch: 15 },  // Account No
    { wch: 10 },  // Status
  ];

  XLSX.utils.book_append_sheet(wb, ws, 'Workers');
  XLSX.writeFile(wb, `Workers_List_${new Date().toISOString().split('T')[0]}.xlsx`);
}
