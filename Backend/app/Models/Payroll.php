<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Payroll extends Model
{
    use HasFactory;

    protected $fillable = [
        'worker_id',
        'month',
        'year',
        'basic_salary',
        'epf_employee',
        'etf_employer',
        'net_salary',
        'payment_method',
        'paid_date',
        'paid_status',
        'present_days',
        'leave_days',
        'ot_hours',
        'ot_rate',
        'ot_amount',
        'incentives',
        'other_deductions',
    ];

    public function worker()
    {
        return $this->belongsTo(Worker::class);
    }
}
