<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Setting;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $settings = [
            'org_name' => 'Kalvayal Samugaseevaka Sangam',
            'org_email' => 'info@kalvayal.org',
            'org_phone' => '+94 21 123 4567',
            'org_address' => 'Jaffna, Sri Lanka',
            'epf_rate' => '8',
            'etf_rate' => '12',
        ];

        foreach ($settings as $key => $value) {
            Setting::updateOrCreate(['key' => $key], ['value' => $value, 'group' => 'organization']);
        }
    }
}
