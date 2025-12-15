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
        Schema::table('workers', function (Blueprint $table) {
            $table->string('department')->nullable()->after('job_position');
            $table->decimal('cost_of_living_allowance', 10, 2)->default(0)->after('basic_salary');
            $table->decimal('mobile_allowance', 10, 2)->default(0)->after('cost_of_living_allowance');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('workers', function (Blueprint $table) {
            $table->dropColumn(['department', 'cost_of_living_allowance', 'mobile_allowance']);
        });
    }
};
