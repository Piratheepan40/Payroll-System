<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Worker extends Model
{
    use HasFactory;

    protected $fillable = [
        'full_name',
        'address',
        'mobile',
        'email',
        'nic_no',
        'gender',
        'job_position',
        'department',
        'joined_date',
        'basic_salary',
        'cost_of_living_allowance',
        'mobile_allowance',
        'salary_type',
        'bank_name',
        'bank_branch',
        'bank_account_no',
        'status',
    ];
}
