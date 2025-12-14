import { Payroll } from '@/types';
import { formatCurrency } from './salary-utils';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export function generateSalarySlipPDF(payroll: Payroll): void {
  // A5 size: 148mm x 210mm - Optimized for single page
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a5'
  });

  const pageWidth = 148;
  const pageHeight = 210;
  const margin = 12; // Reduced back to 12mm for more width
  const contentWidth = pageWidth - (margin * 2);

  // ==================== HEADER (Compact) ====================
  doc.setFillColor(14, 116, 144);
  doc.rect(0, 0, pageWidth, 35, 'F'); // Reduced height

  doc.setFillColor(6, 182, 212);
  doc.rect(0, 33, pageWidth, 2, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14); // Slightly smaller
  doc.setFont('helvetica', 'bold');
  doc.text('KALVAYAL SAMUGASEEVAKA SANGAM', pageWidth / 2, 13, { align: 'center' });

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Salary Receipt', pageWidth / 2, 21, { align: 'center' });

  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text(`${payroll.month} ${payroll.year}`, pageWidth / 2, 28, { align: 'center' });

  let y = 42; // Start higher up

  // ==================== EMPLOYEE DETAILS (Compact) ====================
  doc.setTextColor(14, 116, 144);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('EMPLOYEE INFORMATION', margin, y);
  doc.setLineWidth(0.4);
  doc.line(margin, y + 1.5, pageWidth - margin, y + 1.5);

  y += 6;
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(8); // Smaller font for data

  const employeeData = [
    { label: 'Name', value: payroll.worker?.full_name || payroll.worker_name || 'N/A' },
    { label: 'NIC', value: payroll.worker?.nic_no || payroll.worker_nic || 'N/A' },
    { label: 'Position', value: payroll.worker?.job_position || payroll.worker_position || 'N/A' },
    { label: 'Date', value: new Date(payroll.paid_date).toLocaleDateString('en-LK') },
    { label: 'Method', value: payroll.payment_method.replace('_', ' ').toUpperCase() },
  ];

  // Two columns layout for employee info to save vertical space
  const midPoint = pageWidth / 2;

  // Left Column (First 3 items)
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

  // Right Column (Last 2 items)
  let rightY = y;
  for (let i = 3; i < 5; i++) {
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(80, 80, 80);
    doc.text(employeeData[i].label + ':', midPoint + 5, rightY);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);
    doc.text(employeeData[i].value, midPoint + 25, rightY);
    rightY += 4.5;
  }

  y = localY + 2;

  // ==================== ATTENDANCE (Compact Horizontal) ====================
  if (payroll.present_days !== undefined && payroll.leave_days !== undefined) {
    // Single line visual summary instead of big section
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(margin, y, contentWidth, 12, 1, 1, 'F');

    doc.setFontSize(8);
    doc.setTextColor(80, 80, 80);
    doc.setFont('helvetica', 'bold');

    const totalDays = payroll.present_days + payroll.leave_days;
    const attendancePercentage = totalDays > 0 ? ((payroll.present_days / totalDays) * 100).toFixed(1) : '0.0';

    // Horizontal layout: Present | Leave | Total | %
    const quarter = contentWidth / 4;
    let x = margin;

    // Present
    doc.text('Present:', x + 2, y + 5);
    doc.setTextColor(22, 163, 74); // Green
    doc.text(`${payroll.present_days} Days`, x + 2, y + 9);

    x += quarter;
    // Leave
    doc.setTextColor(80, 80, 80);
    doc.text('Leave:', x + 2, y + 5);
    doc.setTextColor(220, 38, 38); // Red
    doc.text(`${payroll.leave_days} Days`, x + 2, y + 9);

    x += quarter;
    // Total
    doc.setTextColor(80, 80, 80);
    doc.text('Total:', x + 2, y + 5);
    doc.setTextColor(0, 0, 0);
    doc.text(`${totalDays} Days`, x + 2, y + 9);

    x += quarter;
    // Pct
    doc.setTextColor(80, 80, 80);
    doc.text('Attendance:', x + 2, y + 5);
    doc.setTextColor(14, 116, 144); // Brand
    doc.text(`${attendancePercentage}%`, x + 2, y + 9);

    y += 16;
  } else {
    y += 4;
  }

  // ==================== SALARY BREAKDOWN ====================
  doc.setTextColor(14, 116, 144);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('SALARY DETAILS', margin, y);
  doc.line(margin, y + 1.5, pageWidth - margin, y + 1.5);

  y += 6;

  // Box heights reduced to 14mm
  const boxHeight = 14;
  const boxSpacing = 17; // Gap between boxes vertical start points

  // 1. EARNINGS
  doc.setFillColor(240, 249, 255);
  doc.roundedRect(margin, y, contentWidth, boxHeight, 1, 1, 'F');

  doc.setFontSize(8);
  doc.setTextColor(14, 116, 144);
  doc.setFont('helvetica', 'bold');
  doc.text('EARNINGS', margin + 3, y + 5);

  const salaryLabel = payroll.present_days !== undefined ? 'Earned Salary (Prorated)' : 'Basic Salary';
  doc.setTextColor(60, 60, 60);
  doc.setFont('helvetica', 'normal');
  doc.text(salaryLabel, margin + 40, y + 5);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(9);
  doc.text(formatCurrency(payroll.basic_salary), pageWidth - margin - 3, y + 9, { align: 'right' });

  y += boxSpacing;

  // 2. DEDUCTIONS
  doc.setFillColor(254, 242, 242);
  doc.roundedRect(margin, y, contentWidth, boxHeight, 1, 1, 'F');

  doc.setFontSize(8);
  doc.setTextColor(220, 38, 38);
  doc.setFont('helvetica', 'bold');
  doc.text('DEDUCTIONS', margin + 3, y + 5);

  doc.setTextColor(60, 60, 60);
  doc.setFont('helvetica', 'normal');
  doc.text('EPF (Employee 8%)', margin + 40, y + 5);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(220, 38, 38);
  doc.setFontSize(9);
  doc.text(`- ${formatCurrency(payroll.epf_employee)}`, pageWidth - margin - 3, y + 9, { align: 'right' });

  y += boxSpacing;

  // 3. EMPLOYER CONTRIBUTIONS
  doc.setFillColor(240, 253, 244);
  doc.roundedRect(margin, y, contentWidth, boxHeight, 1, 1, 'F');

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

  y += boxSpacing + 2;

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
  // Fixed position at bottom of page
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

  // Save PDF
  const filenameName = (payroll.worker?.full_name || payroll.worker_name || 'Worker').replace(/\s+/g, '_');
  doc.save(`Salary_Receipt_${filenameName}_${payroll.month}_${payroll.year}.pdf`);
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
