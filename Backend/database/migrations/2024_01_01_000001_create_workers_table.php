<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('workers', function (Blueprint $table) {
            $table->id();
            $table->string('full_name');
            $table->string('address');
            $table->string('mobile', 20);
            $table->string('email')->nullable();
            $table->string('nic_no', 20)->unique();
            $table->enum('gender', ['male', 'female', 'other']);
            $table->string('job_position', 100);
            $table->date('joined_date');
            $table->decimal('basic_salary', 10, 2);
            $table->string('bank_name', 100);
            $table->string('bank_account_no', 50);
            $table->enum('status', ['active', 'inactive'])->default('active');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('workers');
    }
};
