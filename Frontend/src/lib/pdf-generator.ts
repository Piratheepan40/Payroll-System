import { Payroll, Worker as WorkerType } from '@/types';
import { formatCurrency } from './salary-utils';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Helper to draw a single slip on the current page
function drawSalarySlipOnPage(doc: jsPDF, payroll: Payroll) {
  const pageWidth = 148;
  const pageHeight = 210;
  const margin = 12;
  const contentWidth = pageWidth - (margin * 2);

  // ==================== HEADER (Compact) ====================
  doc.setFillColor(14, 116, 144);
  doc.rect(0, 0, pageWidth, 35, 'F');

  doc.setFillColor(6, 182, 212);
  doc.rect(0, 33, pageWidth, 2, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('KALVAYAL SAMUGASEEVAKA SANGAM', pageWidth / 2, 13, { align: 'center' });

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Salary Receipt', pageWidth / 2, 21, { align: 'center' });

  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text(`${payroll.month} ${payroll.year}`, pageWidth / 2, 28, { align: 'center' });

  let y = 42;

  // ==================== EMPLOYEE DETAILS (Compact) ====================
  doc.setTextColor(14, 116, 144);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('EMPLOYEE INFORMATION', margin, y);
  doc.setLineWidth(0.4);
  doc.line(margin, y + 1.5, pageWidth - margin, y + 1.5);

  y += 6;
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(8);

  const department = payroll.worker?.department || 'N/A';
  const cola = payroll.worker?.cost_of_living_allowance || 0;
  const mobile = payroll.worker?.mobile_allowance || 0;

  // Advanced Fields
  const otAmount = payroll.ot_amount || 0;
  const incentives = payroll.incentives || 0;
  const otherDeductions = payroll.other_deductions || 0;

  const employeeData = [
    { label: 'Name', value: payroll.worker?.full_name || payroll.worker_name || 'N/A' },
    { label: 'NIC', value: payroll.worker?.nic_no || payroll.worker_nic || 'N/A' },
    { label: 'Position', value: payroll.worker?.job_position || payroll.worker_position || 'N/A' },
    { label: 'Dept', value: department },
    { label: 'Bank', value: payroll.worker?.bank_name || 'N/A' },
    { label: 'Branch', value: payroll.worker?.bank_branch || 'N/A' },
    { label: 'Acc No', value: payroll.worker?.bank_account_no || 'N/A' },
    { label: 'Date', value: new Date(payroll.paid_date).toLocaleDateString('en-LK') },
  ];

  const midPoint = pageWidth / 2;

  // Left Column
  let localY = y;
  for (let i = 0; i < 3; i++) {
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(80, 80, 80);
    doc.text(employeeData[i].label + ':', margin, localY);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);
    doc.text(employeeData[i].value, margin + 25, localY);
    localY += 4.5;
  }

  // Right Column
  let rightY = y;
  for (let i = 3; i < employeeData.length; i++) {
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(80, 80, 80);
    doc.text(employeeData[i].label + ':', midPoint + 5, rightY);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);
    doc.text(employeeData[i].value, midPoint + 25, rightY);
    rightY += 4.5;
  }

  y = Math.max(localY, rightY) + 2;

  // ==================== SALARY BREAKDOWN ====================
  const earningsItems = [
    { label: payroll.present_days !== undefined ? 'Earned Salary' : 'Basic Salary', value: payroll.basic_salary }
  ];
  if (cola > 0) earningsItems.push({ label: 'Cost of Living', value: cola });
  if (mobile > 0) earningsItems.push({ label: 'Mobile Allowance', value: mobile });
  if (otAmount > 0) earningsItems.push({ label: `Overtime (${payroll.ot_hours || 0} hrs)`, value: otAmount });
  if (incentives > 0) earningsItems.push({ label: 'Incentives / Bonus', value: incentives });

  const earningsBoxHeight = Math.max(14, 6 + (earningsItems.length * 4));

  doc.setTextColor(14, 116, 144);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('SALARY DETAILS', margin, y);
  doc.line(margin, y + 1.5, pageWidth - margin, y + 1.5);

  y += 6;

  // 1. EARNINGS
  doc.setFillColor(240, 249, 255);
  doc.roundedRect(margin, y, contentWidth, earningsBoxHeight, 1, 1, 'F');

  doc.setFontSize(8);
  doc.setTextColor(14, 116, 144);
  doc.setFont('helvetica', 'bold');
  doc.text('EARNINGS', margin + 3, y + 5);

  let earnY = y + 5;
  earningsItems.forEach((item) => {
    doc.setTextColor(60, 60, 60);
    doc.setFont('helvetica', 'normal');
    doc.text(item.label, margin + 40, earnY);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(9);
    doc.text(formatCurrency(item.value), pageWidth - margin - 3, earnY, { align: 'right' });
    earnY += 4;
  });

  y += earningsBoxHeight + 3;

  // 2. DEDUCTIONS
  const deductionItems = [
    { label: 'EPF (Employee 8%)', value: payroll.epf_employee }
  ];
  if (otherDeductions > 0) deductionItems.push({ label: 'Other Deductions', value: otherDeductions });

  const deductionsBoxHeight = Math.max(14, 6 + (deductionItems.length * 4));

  doc.setFillColor(254, 242, 242);
  doc.roundedRect(margin, y, contentWidth, deductionsBoxHeight, 1, 1, 'F');

  doc.setFontSize(8);
  doc.setTextColor(220, 38, 38);
  doc.setFont('helvetica', 'bold');
  doc.text('DEDUCTIONS', margin + 3, y + 5);

  let dedY = y + 5;
  deductionItems.forEach((item) => {
    doc.setTextColor(60, 60, 60);
    doc.setFont('helvetica', 'normal');
    doc.text(item.label, margin + 40, dedY);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(220, 38, 38);
    doc.setFontSize(9);
    doc.text(`- ${formatCurrency(item.value)}`, pageWidth - margin - 3, dedY, { align: 'right' });
    dedY += 4;
  });

  y += deductionsBoxHeight + 3;

  // 3. EMPLOYER
  doc.setFillColor(240, 253, 244);
  doc.roundedRect(margin, y, contentWidth, 14, 1, 1, 'F');

  doc.setFontSize(8);
  doc.setTextColor(22, 163, 74);
  doc.setFont('helvetica', 'bold');
  doc.text('EMPLOYER', margin + 3, y + 5);

  doc.setTextColor(60, 60, 60);
  doc.setFont('helvetica', 'normal');
  doc.text('ETF (Employer 12%)', margin + 40, y + 5);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(22, 163, 74);
  doc.setFontSize(9);
  doc.text(formatCurrency(payroll.etf_employer), pageWidth - margin - 3, y + 9, { align: 'right' });

  y += 17;

  // ==================== NET SALARY ====================
  doc.setFillColor(14, 116, 144);
  doc.roundedRect(margin, y, contentWidth, 14, 1, 1, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('NET SALARY PAYABLE', margin + 5, y + 9);

  doc.setFontSize(12);
  doc.text(formatCurrency(payroll.net_salary), pageWidth - margin - 5, y + 9, { align: 'right' });

  // ==================== SIGNATURES ====================
  const signatureY = pageHeight - 32;

  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.3);

  const sigBoxWidth = 50;

  // Left Sig
  doc.line(margin + 5, signatureY, margin + 5 + sigBoxWidth, signatureY);
  doc.setTextColor(100, 100, 100);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.text('Authorized Signature', margin + 5 + (sigBoxWidth / 2), signatureY + 4, { align: 'center' });

  // Right Sig
  const rightSigX = pageWidth - margin - 5 - sigBoxWidth;
  doc.line(rightSigX, signatureY, rightSigX + sigBoxWidth, signatureY);
  doc.text('Receiver Signature', rightSigX + (sigBoxWidth / 2), signatureY + 4, { align: 'center' });

  // ==================== FOOTER ====================
  const footerY = pageHeight - 10;
  doc.setDrawColor(230, 230, 230);
  doc.setLineWidth(0.1);
  doc.line(margin, footerY - 4, pageWidth - margin, footerY - 4);

  doc.setTextColor(160, 160, 160);
  doc.setFontSize(6);
  doc.setFont('helvetica', 'italic');
  doc.text(`Generated on ${new Date().toLocaleString('en-LK')}`, pageWidth / 2, footerY, { align: 'center' });
  doc.text('This transcript is computer generated.', pageWidth / 2, footerY + 3, { align: 'center' });
}

export function generateSalarySlipPDF(payroll: Payroll): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a5'
  });

  drawSalarySlipOnPage(doc, payroll);

  const filenameName = (payroll.worker?.full_name || payroll.worker_name || 'Worker').replace(/\s+/g, '_');
  doc.save(`Salary_Receipt_${filenameName}_${payroll.month}_${payroll.year}.pdf`);
}

export function generateBulkSalarySlipsPDF(payrolls: Payroll[]): void {
  if (!payrolls || payrolls.length === 0) return;

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a5'
  });

  payrolls.forEach((payroll, index) => {
    if (index > 0) {
      doc.addPage('a5', 'portrait');
    }
    drawSalarySlipOnPage(doc, payroll);
  });

  doc.save(`Bulk_Salary_Receipts_${payrolls.length}_Workers.pdf`);
}
export function generateDashboardReportPDF(
  stats: any,
  payrolls: Payroll[],
  month: string,
  year: number
): void {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // Header
  doc.setFillColor(14, 116, 144);
  doc.rect(0, 0, pageWidth, 50, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('Kalvayal Samugaseevaka Sangam', pageWidth / 2, 20, { align: 'center' });

  doc.setFontSize(16);
  doc.setFont('helvetica', 'normal');
  doc.text('PAYROLL REPORT', pageWidth / 2, 32, { align: 'center' });

  doc.setFontSize(12);
  doc.text(`${month} ${year}`, pageWidth / 2, 43, { align: 'center' });

  // Summary Statistics
  let y = 65;
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('SUMMARY', 20, y);

  doc.setDrawColor(14, 116, 144);
  doc.setLineWidth(0.5);
  doc.line(20, y + 3, 190, y + 3);

  y += 15;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');

  const summaryData = [
    ['Total Workers', stats.total_workers.toString()],
    ['Active Workers', stats.active_workers.toString()],
    ['Total Basic Salary', formatCurrency(stats.total_salary_this_month)],
    ['Total EPF (8%)', formatCurrency(stats.total_epf_this_month)],
    ['Total ETF (12%)', formatCurrency(stats.total_etf_this_month)],
    ['Total Net Paid', formatCurrency(stats.total_net_salary_this_month)],
  ];

  autoTable(doc, {
    startY: y,
    head: [['Metric', 'Value']],
    body: summaryData,
    theme: 'grid',
    headStyles: { fillColor: [14, 116, 144], fontSize: 10, fontStyle: 'bold' },
    styles: { fontSize: 9 },
    margin: { left: 20, right: 20 },
  });

  // Payroll Details
  y = (doc as any).lastAutoTable.finalY + 15;
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('PAYROLL DETAILS', 20, y);
  doc.line(20, y + 3, 190, y + 3);

  const payrollData = payrolls.map((p) => [
    p.worker?.full_name || p.worker_name || 'N/A',
    p.worker?.job_position || p.worker_position || 'N/A',
    formatCurrency(p.basic_salary),
    formatCurrency(p.epf_employee),
    formatCurrency(p.etf_employer),
    formatCurrency(p.net_salary),
    p.paid_status.toUpperCase(),
  ]);

  autoTable(doc, {
    startY: y + 8,
    head: [['Employee', 'Position', 'Basic', 'EPF', 'ETF', 'Net', 'Status']],
    body: payrollData,
    theme: 'striped',
    headStyles: { fillColor: [14, 116, 144], fontSize: 8, fontStyle: 'bold' },
    styles: { fontSize: 7, cellPadding: 2 },
    columnStyles: {
      0: { cellWidth: 35 },
      1: { cellWidth: 30 },
      2: { cellWidth: 25, halign: 'right' },
      3: { cellWidth: 20, halign: 'right' },
      4: { cellWidth: 20, halign: 'right' },
      5: { cellWidth: 25, halign: 'right' },
      6: { cellWidth: 15, halign: 'center' },
    },
    margin: { left: 20, right: 20 },
  });

  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(
      `Generated on: ${new Date().toLocaleString('en-LK')}`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    );
    doc.text(
      `Page ${i} of ${pageCount}`,
      pageWidth - 20,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'right' }
    );
  }

  doc.save(`Payroll_Report_${month}_${year}.pdf`);
}

export function generateExperienceLetter(worker: WorkerType): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const contentWidth = pageWidth - (margin * 2);

  // Letterhead
  doc.setFillColor(14, 116, 144); // Primary color
  doc.rect(0, 0, pageWidth, 40, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('KALVAYAL SAMUGASEEVAKA SANGAM', pageWidth / 2, 20, { align: 'center' });
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('123 Main Street, Jaffna, Sri Lanka | +94 77 123 4567 | info@kalvayal.com', pageWidth / 2, 30, { align: 'center' });

  // Date
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(11);
  doc.text(`Date: ${new Date().toLocaleDateString('en-LK')}`, margin, 55);

  // Title
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('TO WHOM IT MAY CONCERN', pageWidth / 2, 70, { align: 'center' });
  doc.setLineWidth(0.5);
  doc.line(margin, 72, pageWidth - margin, 72);

  // Body
  const joinDate = new Date(worker.joined_date).toLocaleDateString('en-LK');
  const exitDate = worker.resignation_date ? new Date(worker.resignation_date).toLocaleDateString('en-LK') : 'Present';
  const lastWorking = worker.last_working_date ? new Date(worker.last_working_date).toLocaleDateString('en-LK') : new Date().toLocaleDateString('en-LK');

  const bodyText = `
This is to certify that Mr./Ms. ${worker.full_name} (NIC: ${worker.nic_no}) was employed with Kalvayal Samugaseevaka Sangam as a ${worker.job_position} from ${joinDate} to ${lastWorking}.

During their tenure, we found them to be sincere, hardworking, and dedicated to their duties. They have shown great initiative and have been a valuable asset to our organization.

We confirm that they have been relieved of their duties effective close of business on ${lastWorking} following their resignation on ${exitDate || 'N/A'}.

We wish them all the best in their future endeavors.
  `;

  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  const splitText = doc.splitTextToSize(bodyText.trim(), contentWidth);
  doc.text(splitText, margin, 90);

  // Signature
  const sigY = 180;
  doc.text('Sincerely,', margin, sigY);

  doc.setFont('helvetica', 'bold');
  doc.text('Manager / Director', margin, sigY + 25);
  doc.setFont('helvetica', 'normal');
  doc.text('Kalvayal Samugaseevaka Sangam', margin, sigY + 30);

  // Footer/Stamp area
  doc.setDrawColor(200, 200, 200);
  doc.rect(pageWidth - margin - 40, sigY - 10, 40, 40);
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text('Official Stamp', pageWidth - margin - 20, sigY + 10, { align: 'center' });

  doc.save(`Experience_Letter_${worker.full_name.replace(/\s+/g, '_')}.pdf`);
}
