<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body {
            font-family: 'DejaVu Sans', sans-serif;
            font-size: 12px;
            color: #333;
        }
        .header {
            background: #0e7490;
            color: white;
            padding: 20px;
            text-align: center;
            margin-bottom: 20px;
        }
        .header h1 {
            margin: 0;
            font-size: 20px;
        }
        .section-title {
            background: #f1f5f9;
            padding: 8px;
            margin: 15px 0 10px 0;
            font-weight: bold;
            border-left: 4px solid #0e7490;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin: 10px 0;
        }
        .info-table td {
            padding: 5px;
            border-bottom: 1px solid #e2e8f0;
        }
        .info-table td:first-child {
            font-weight: bold;
            width: 40%;
        }
        .salary-table {
            margin: 15px 0;
        }
        .salary-table th {
            background: #f1f5f9;
            padding: 10px;
            text-align: left;
            border-bottom: 2px solid #0e7490;
        }
        .salary-table td {
            padding: 8px;
            border-bottom: 1px solid #e2e8f0;
        }
        .salary-table td.amount {
            text-align: right;
            font-weight: bold;
        }
        .total-row {
            background: #0e7490;
            color: white;
            font-weight: bold;
            font-size: 14px;
        }
        .total-row td {
            padding: 12px;
        }
        .footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e2e8f0;
            text-align: center;
            font-size: 10px;
            color: #64748b;
        }
        .signature-line {
            margin-top: 40px;
            border-top: 1px solid #333;
            width: 200px;
            display: inline-block;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>KALVAYAL SAMUGASEEVAKA SANGAM</h1>
        <p style="margin: 5px 0;">SALARY RECEIPT</p>
        <p style="margin: 5px 0;">{{ $payroll->month }} {{ $payroll->year }}</p>
    </div>

    <div class="section-title">EMPLOYEE DETAILS</div>
    <table class="info-table">
        <tr>
            <td>Employee Name:</td>
            <td>{{ $payroll->worker->full_name ?? $payroll->worker_name }}</td>
        </tr>
        <tr>
            <td>NIC Number:</td>
            <td>{{ $payroll->worker->nic_no ?? $payroll->worker_nic }}</td>
        </tr>
        <tr>
            <td>Position:</td>
            <td>{{ $payroll->worker->job_position ?? $payroll->worker_position }}</td>
        </tr>
        <tr>
            <td>Payment Date:</td>
            <td>{{ \Carbon\Carbon::parse($payroll->paid_date)->format('F d, Y') }}</td>
        </tr>
        <tr>
            <td>Payment Method:</td>
            <td>{{ strtoupper(str_replace('_', ' ', $payroll->payment_method)) }}</td>
        </tr>
    </table>

    @if($payroll->present_days !== null && $payroll->leave_days !== null)
    <div class="section-title">ATTENDANCE</div>
    <table class="info-table">
        <tr>
            <td>Present Days:</td>
            <td>{{ $payroll->present_days }} days</td>
        </tr>
        <tr>
            <td>Leave Days:</td>
            <td>{{ $payroll->leave_days }} days</td>
        </tr>
        <tr>
            <td>Total Days:</td>
            <td>{{ $payroll->present_days + $payroll->leave_days }} days</td>
        </tr>
        <tr>
            <td>Attendance Percentage:</td>
            <td>{{ number_format(($payroll->present_days / ($payroll->present_days + $payroll->leave_days)) * 100, 1) }}%</td>
        </tr>
    </table>
    @endif

    <div class="section-title">SALARY BREAKDOWN</div>
    <table class="salary-table">
        <thead>
            <tr>
                <th>Description</th>
                <th style="text-align: right;">Amount (LKR)</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>{{ $payroll->present_days !== null ? 'Earned Salary (Prorated)' : 'Basic Salary' }}</td>
                <td class="amount">{{ number_format($payroll->basic_salary, 2) }}</td>
            </tr>
            <tr>
                <td>EPF Employee Contribution (8%)</td>
                <td class="amount" style="color: #dc2626;">- {{ number_format($payroll->epf_employee, 2) }}</td>
            </tr>
            <tr>
                <td>ETF Employer Contribution (12%)</td>
                <td class="amount" style="color: #16a34a;">{{ number_format($payroll->etf_employer, 2) }}</td>
            </tr>
            <tr class="total-row">
                <td>NET SALARY PAYABLE</td>
                <td class="amount">{{ number_format($payroll->net_salary, 2) }}</td>
            </tr>
        </tbody>
    </table>

    <div style="margin-top: 50px;">
        <table style="width: 100%;">
            <tr>
                <td style="width: 50%; text-align: center;">
                    <div class="signature-line"></div>
                    <p style="margin-top: 5px;">Authorized Signature</p>
                </td>
                <td style="width: 50%; text-align: center;">
                    <div class="signature-line"></div>
                    <p style="margin-top: 5px;">Employee Signature</p>
                </td>
            </tr>
        </table>
    </div>

    <div class="footer">
        <p>This is a computer-generated salary receipt.</p>
        <p>Generated on {{ now()->format('F d, Y \a\t h:i A') }}</p>
    </div>
</body>
</html>
