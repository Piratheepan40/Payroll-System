<?php

namespace App\Http\Controllers;

use App\Models\Setting;
use Illuminate\Http\Request;

use Illuminate\Support\Facades\Schema;

class SettingController extends Controller
{
    public function index()
    {
        // Return settings as key-value pairs
        return Setting::all()->pluck('value', 'key');
    }

    public function update(Request $request)
    {
        $validated = $request->validate([
            'settings' => 'required|array',
        ]);

        foreach ($validated['settings'] as $key => $value) {
            Setting::updateOrCreate(
                ['key' => $key],
                ['value' => $value]
            );
        }

        return response()->json(['message' => 'Settings updated successfully']);
    }
    public function backup()
    {
        // Simple backup mechanism
        // For SQLite, we can download the file.
        // For MySQL, we'll export all tables to JSON as a simple backup solution
        // since mysqldump might not be available in the environment.
        
        $connection = config('database.default');
        
        if ($connection === 'sqlite') {
            $dbPath = database_path('database.sqlite');
            if (file_exists($dbPath)) {
                return response()->download($dbPath, 'backup-' . date('Y-m-d-H-i-s') . '.sqlite');
            }
        }

        // Fallback: JSON Export of key tables
        $data = [
            'workers' => \App\Models\Worker::all(),
            'payrolls' => \App\Models\Payroll::all(),
            'settings' => \App\Models\Setting::all(),
            'exported_at' => now(),
        ];
        
        return response()->streamDownload(function () use ($data) {
            echo json_encode($data, JSON_PRETTY_PRINT);
        }, 'backup-' . date('Y-m-d-H-i-s') . '.json');
    }

    public function reset()
    {
        // Truncate tables to reset business data
        // We do NOT delete the user or settings
        
        Schema::disableForeignKeyConstraints();
        
        try {
            \App\Models\Payroll::truncate();
            \App\Models\Worker::truncate();
        } finally {
            Schema::enableForeignKeyConstraints();
        }
        
        // Also reset auto-increment if possible, though truncate usually does this.
        
        return response()->json(['message' => 'System data reset successfully']);
    }
}
