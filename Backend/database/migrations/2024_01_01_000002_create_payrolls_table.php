<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payrolls', function (Blueprint $table) {
            $table->id();
            $table->foreignId('worker_id')->constrained()->onDelete('cascade');
            $table->string('month', 20);
            $table->integer('year');
            $table->decimal('basic_salary', 10, 2);
            $table->decimal('epf_employee', 10, 2);
            $table->decimal('etf_employer', 10, 2);
            $table->decimal('net_salary', 10, 2);
            $table->enum('payment_method', ['cash', 'bank_transfer', 'cheque']);
            $table->date('paid_date');
            $table->enum('paid_status', ['pending', 'paid'])->default('pending');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payrolls');
    }
};
