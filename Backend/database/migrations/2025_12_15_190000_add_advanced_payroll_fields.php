<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('payrolls', function (Blueprint $table) {
            $table->decimal('ot_hours', 5, 2)->default(0)->after('net_salary');
            $table->decimal('ot_rate', 10, 2)->default(0)->after('ot_hours');
            $table->decimal('ot_amount', 10, 2)->default(0)->after('ot_rate');
            $table->decimal('incentives', 10, 2)->default(0)->after('ot_amount');
            $table->decimal('other_deductions', 10, 2)->default(0)->after('incentives');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('payrolls', function (Blueprint $table) {
            $table->dropColumn(['ot_hours', 'ot_rate', 'ot_amount', 'incentives', 'other_deductions']);
        });
    }
};
