<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            background: linear-gradient(135deg, #0e7490 0%, #06b6d4 100%);
            color: white;
            padding: 30px;
            text-align: center;
            border-radius: 10px 10px 0 0;
        }
        .header h1 {
            margin: 0;
            font-size: 24px;
        }
        .content {
            background: #f8fafc;
            padding: 30px;
            border-radius: 0 0 10px 10px;
        }
        .greeting {
            font-size: 18px;
            margin-bottom: 20px;
        }
        .info-box {
            background: white;
            border-left: 4px solid #0e7490;
            padding: 15px;
            margin: 20px 0;
            border-radius: 5px;
        }
        .info-box strong {
            color: #0e7490;
        }
        .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e2e8f0;
            color: #64748b;
            font-size: 14px;
        }
        .button {
            display: inline-block;
            background: #0e7490;
            color: white;
            padding: 12px 30px;
            text-decoration: none;
            border-radius: 5px;
            margin: 20px 0;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>Kalvayal Samugaseevaka Sangam</h1>
        <p style="margin: 5px 0 0 0;">Salary Receipt</p>
    </div>
    
    <div class="content">
        <p class="greeting">Dear {{ $workerName }},</p>
        
        <p>Your salary for <strong>{{ $month }} {{ $year }}</strong> has been processed successfully.</p>
        
        <div class="info-box">
            <p style="margin: 5px 0;"><strong>Net Salary Paid:</strong> LKR {{ $netSalary }}</p>
            <p style="margin: 5px 0;"><strong>Payment Method:</strong> {{ ucwords(str_replace('_', ' ', $payroll->payment_method)) }}</p>
            <p style="margin: 5px 0;"><strong>Payment Date:</strong> {{ \Carbon\Carbon::parse($payroll->paid_date)->format('F d, Y') }}</p>
        </div>
        
        @if($payroll->present_days !== null && $payroll->leave_days !== null)
        <div class="info-box">
            <p style="margin: 5px 0;"><strong>Attendance Summary:</strong></p>
            <p style="margin: 5px 0;">Present Days: {{ $payroll->present_days }} days</p>
            <p style="margin: 5px 0;">Leave Days: {{ $payroll->leave_days }} days</p>
            <p style="margin: 5px 0;">Total Days: {{ $payroll->present_days + $payroll->leave_days }} days</p>
        </div>
        @endif
        
        <p>Please find your detailed salary receipt attached to this email as a PDF document.</p>
        
        <p>If you have any questions or concerns regarding your salary, please contact the administration office.</p>
        
        <div class="footer">
            <p><strong>Kalvayal Samugaseevaka Sangam</strong></p>
            <p>This is an automated email. Please do not reply to this message.</p>
            <p style="font-size: 12px; color: #94a3b8;">Generated on {{ now()->format('F d, Y \a\t h:i A') }}</p>
        </div>
    </div>
</body>
</html>
