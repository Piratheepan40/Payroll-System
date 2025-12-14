<?php

namespace App\Http\Controllers;

use App\Models\Worker;
use App\Models\Payroll;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function stats()
    {
        $activeWorkers = Worker::where('status', 'active')->count();
        $totalWorkers = Worker::count();
        
        // This month calculations (simple version)
        $currentMonth = date('F');
        $currentYear = date('Y');
        
        $currentPayrolls = Payroll::where('month', $currentMonth)
            ->where('year', $currentYear)
            ->get();
            
        $totalSalary = $currentPayrolls->sum('basic_salary');
        $totalEpf = $currentPayrolls->sum('epf_employee');
        $totalEtf = $currentPayrolls->sum('etf_employer');
        $totalNet = $currentPayrolls->sum('net_salary');
        
        return response()->json([
            'total_workers' => $totalWorkers,
            'active_workers' => $activeWorkers,
            'total_salary_this_month' => $totalSalary,
            'total_epf_this_month' => $totalEpf,
            'total_etf_this_month' => $totalEtf,
            'total_net_salary_this_month' => $totalNet,
        ]);
    }

    public function monthlyStats()
    {
        $months = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];
        
        $data = [];
        $currentYear = date('Y');

        foreach ($months as $month) {
            $payrolls = Payroll::where('month', $month)->where('year', $currentYear)->get();
            // Using short month name for display
            $shortMonth = date('M', strtotime("$month 1 2000"));
            
            $data[] = [
                'month' => $shortMonth,
                'total_salary' => $payrolls->sum('basic_salary') ?: 0,
                'total_epf' => $payrolls->sum('epf_employee') ?: 0,
                'total_etf' => $payrolls->sum('etf_employer') ?: 0,
                'net_salary' => $payrolls->sum('net_salary') ?: 0,
            ];
        }

        return response()->json($data);
    }
}
