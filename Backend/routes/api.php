<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\WorkerController;
use App\Http\Controllers\PayrollController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\SettingController;
use App\Http\Controllers\AuthController;

Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/auth/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/auth/user', [AuthController::class, 'user']);

    Route::apiResource('workers', WorkerController::class);
    Route::apiResource('payrolls', PayrollController::class);
    
    Route::get('/dashboard/stats', [DashboardController::class, 'stats']);
    Route::get('/dashboard/monthly-stats', [DashboardController::class, 'monthlyStats']);
    
    Route::get('/settings', [SettingController::class, 'index']);
    Route::post('/settings', [SettingController::class, 'update']);
    Route::get('/settings/backup', [SettingController::class, 'downloadBackup']);
    Route::post('/settings/reset', [SettingController::class, 'reset']);
});
