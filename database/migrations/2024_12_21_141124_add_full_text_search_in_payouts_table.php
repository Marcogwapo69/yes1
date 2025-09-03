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
        if (Schema::getConnection()->getDriverName() !== 'sqlite') {
            Schema::table('payouts', function (Blueprint $table) {
                $table->fullText(['channel_code', 'account_number', 'account_holder_name']);
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::getConnection()->getDriverName() !== 'sqlite') {
            Schema::table('payouts', function (Blueprint $table) {
                $table->dropFullText(['channel_code', 'account_number', 'account_holder_name']);
            });
        }
    }
};
