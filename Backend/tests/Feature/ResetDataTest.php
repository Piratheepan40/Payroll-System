<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Models\Worker;
use App\Models\Payroll;
use Illuminate\Support\Facades\Schema;

class ResetDataTest extends TestCase
{
    public function test_reset_data_endpoint_clears_workers_and_payrolls()
    {
        // 1. Create a user and authenticate
        $user = User::factory()->create();
        
        // 2. Create some sample data manually
        Worker::create([
            'full_name' => 'John Doe',
            'address' => '123 Main St',
            'mobile' => '1234567890',
            'nic_no' => '123456789V',
            'gender' => 'male',
            'job_position' => 'Laborer',
            'joined_date' => '2023-01-01',
            'basic_salary' => 50000,
            'status' => 'active'
        ]);
        
        \App\Models\Payroll::forceCreate([
             'worker_id' => 1,
             'worker_name' => 'John Doe',
             'month' => 'January',
             'year' => 2023,
             'basic_salary' => 50000,
             'net_salary' => 45000,
             'paid_status' => 'paid',
             'payment_method' => 'cash'
        ]);
        
        $this->assertDatabaseCount('workers', 1);
        $this->assertDatabaseCount('payrolls', 1);
        
        // 3. Call the reset endpoint
        $response = $this->actingAs($user)
                         ->postJson('/api/settings/reset');
        
        // 4. Assert success
        $response->assertStatus(200)
                 ->assertJson(['message' => 'System data reset successfully']);
                 
        // 5. Assert database is empty
        $this->assertDatabaseCount('workers', 0);
        $this->assertDatabaseCount('payrolls', 0);
    }
}
