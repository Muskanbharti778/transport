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
        Schema::create('drivers', function (Blueprint $table) {
          $table->id('driverid');

            $table->string('drivername');

            $table->string('mobile', 20)->unique();
        $table->enum('balance_type', ['has_to_pay', 'has_to_get'])->nullable();
            $table->decimal('opening_balance', 12, 2)->default(0);
            $table->string('driverphoto')->nullable();
            $table->boolean('status')->default(1);
            $table->unsignedBigInteger('companyid')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('drivers');
    }
};
