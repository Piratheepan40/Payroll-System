<?php

namespace App\Http\Controllers;

use App\Models\Worker;
use Illuminate\Http\Request;

class WorkerController extends Controller
{
    public function index()
    {
        return Worker::orderBy('created_at', 'desc')->get();
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'full_name' => 'required|string',
            'address' => 'required|string',
            'mobile' => 'required|string',
            'nic_no' => 'required|string|unique:workers,nic_no',
            'gender' => 'required|in:male,female,other',
            'job_position' => 'required|string',
            'joined_date' => 'required|date',
            'basic_salary' => 'required|numeric',
            'cost_of_living_allowance' => 'nullable|numeric',
            'mobile_allowance' => 'nullable|numeric',
            'salary_type' => 'in:monthly,daily,contract',
            'bank_name' => 'required|string',
            'bank_branch' => 'nullable|string',
            'bank_account_no' => 'required|string',
            'email' => 'nullable|email',
            'status' => 'in:active,inactive'
        ]);

        $worker = Worker::create($validated);
        return response()->json($worker, 201);
    }

    public function show(Worker $worker)
    {
        return $worker;
    }

    public function update(Request $request, Worker $worker)
    {
        $validated = $request->validate([
            'full_name' => 'string',
            'address' => 'string',
            'mobile' => 'string',
            'nic_no' => 'string|unique:workers,nic_no,' . $worker->id,
            'gender' => 'in:male,female,other',
            'job_position' => 'string',
            'joined_date' => 'date',
            'basic_salary' => 'numeric',
            'cost_of_living_allowance' => 'nullable|numeric',
            'mobile_allowance' => 'nullable|numeric',
            'salary_type' => 'in:monthly,daily,contract',
            'bank_name' => 'string',
            'bank_branch' => 'nullable|string',
            'bank_account_no' => 'string',
            'email' => 'nullable|email',
            'status' => 'in:active,inactive'
        ]);

        $worker->update($validated);
        return response()->json($worker);
    }

    public function destroy(Worker $worker)
    {
        $worker->delete();
        return response()->noContent();
    }
}
