<?php

namespace App\Http\Controllers;

use App\Models\Payroll;
use App\Mail\SalaryReceiptMail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;

class PayrollController extends Controller
{
    public function index()
    {
        return Payroll::with('worker')->orderBy('created_at', 'desc')->get();
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'worker_id' => 'required|exists:workers,id',
            'month' => 'required|string',
            'year' => 'required|integer',
            'basic_salary' => 'required|numeric',
            'epf_employee' => 'required|numeric',
            'etf_employer' => 'required|numeric',
            'net_salary' => 'required|numeric',
            'payment_method' => 'required|in:cash,bank_transfer,cheque',
            'paid_date' => 'required|date',
            'paid_status' => 'in:pending,paid',
            'present_days' => 'nullable|integer|min:0',
            'leave_days' => 'nullable|integer|min:0',
            'ot_hours' => 'nullable|numeric|min:0',
            'ot_rate' => 'nullable|numeric|min:0',
            'ot_amount' => 'nullable|numeric|min:0',
            'incentives' => 'nullable|numeric|min:0',
            'other_deductions' => 'nullable|numeric|min:0',
        ]);

        // Check for duplicate payment
        $existingPayroll = Payroll::where('worker_id', $validated['worker_id'])
            ->where('month', $validated['month'])
            ->where('year', $validated['year'])
            ->where('paid_status', 'paid')
            ->first();

        if ($existingPayroll) {
            return response()->json([
                'message' => 'Already Paid',
                'error' => 'This worker has already been paid for ' . $validated['month'] . ' ' . $validated['year'],
                'existing_payroll' => $existingPayroll
            ], 422);
        }

        $payroll = Payroll::create($validated);
        $payroll->load('worker');

        // Send email receipt to worker
        try {
            if ($payroll->worker && $payroll->worker->email) {
                Mail::to($payroll->worker->email)->send(new SalaryReceiptMail($payroll));
                Log::info("Salary receipt email sent to {$payroll->worker->email}");
            } else {
                Log::warning("Skipped email receipt: Worker has no email address or worker not found. Worker ID: {$payroll->worker_id}");
            }
        } catch (\Exception $e) {
            // Log error but don't fail the request
            Log::error("Failed to send salary receipt email: " . $e->getMessage());
            Log::error($e->getTraceAsString());
        }

        return response()->json($payroll, 201);
    }

    public function bulkStore(Request $request)
    {
        $validated = $request->validate([
            'payrolls' => 'required|array',
            'payrolls.*.worker_id' => 'required|exists:workers,id',
            'payrolls.*.month' => 'required|string',
            'payrolls.*.year' => 'required|integer',
            'payrolls.*.basic_salary' => 'required|numeric',
            'payrolls.*.epf_employee' => 'required|numeric',
            'payrolls.*.etf_employer' => 'required|numeric',
            'payrolls.*.net_salary' => 'required|numeric',
            'payrolls.*.payment_method' => 'required|in:cash,bank_transfer,cheque',
            'payrolls.*.paid_date' => 'required|date',
            'payrolls.*.paid_status' => 'in:pending,paid',
            'payrolls.*.present_days' => 'nullable|integer|min:0',
            'payrolls.*.leave_days' => 'nullable|integer|min:0',
            'payrolls.*.ot_hours' => 'nullable|numeric|min:0',
            'payrolls.*.ot_rate' => 'nullable|numeric|min:0',
            'payrolls.*.ot_amount' => 'nullable|numeric|min:0',
            'payrolls.*.incentives' => 'nullable|numeric|min:0',
            'payrolls.*.other_deductions' => 'nullable|numeric|min:0',
        ]);

        $createdPayrolls = [];
        $errors = [];

        foreach ($validated['payrolls'] as $index => $data) {
            // Check for duplicate
            $exists = Payroll::where('worker_id', $data['worker_id'])
                ->where('month', $data['month'])
                ->where('year', $data['year'])
                ->where('paid_status', 'paid')
                ->exists();

            if ($exists) {
                $errors[] = "Worker ID {$data['worker_id']} already paid for {$data['month']} {$data['year']}.";
                continue;
            }

            $payroll = Payroll::create($data);
            
            // Send email (optional: queue this for bulk)
            try {
                if ($payroll->worker && $payroll->worker->email) {
                    // Ideally use Queue here for bulk
                    Mail::to($payroll->worker->email)->send(new SalaryReceiptMail($payroll));
                }
            } catch (\Exception $e) {
                Log::error("Bulk email failed for ID {$payroll->id}: " . $e->getMessage());
            }

            $createdPayrolls[] = $payroll;
        }

        return response()->json([
            'message' => 'Bulk processing completed',
            'processed_count' => count($createdPayrolls),
            'errors' => $errors
        ], 201);
    }

    public function show(Payroll $payroll)
    {
        return $payroll->load('worker');
    }

    public function destroy(Payroll $payroll)
    {
        $payroll->delete();
        return response()->noContent();
    }
}
