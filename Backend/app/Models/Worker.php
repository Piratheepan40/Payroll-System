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
        'joined_date',
        'basic_salary',
        'bank_name',
        'bank_account_no',
        'status',
    ];
}
