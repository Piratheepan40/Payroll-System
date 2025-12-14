<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;

Route::get('/', function () {
    return view('welcome');
});

Route::get('/test-email', function () {
    try {
        Mail::raw('This is a test email from Kalvayal Payroll System.', function ($message) {
            $message->to('test@example.com') // Replace with your email for testing logic, but user will override
                   ->subject('Test Email Config');
        });
        
        return 'Email sent successfully! Check your logs for details, but if you see this, the connection likely worked.';
    } catch (\Exception $e) {
        return 'Failed to send email. Error: ' . $e->getMessage();
    }
});
