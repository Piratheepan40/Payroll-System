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
    ];

    public function worker()
    {
        return $this->belongsTo(Worker::class);
    }
}
