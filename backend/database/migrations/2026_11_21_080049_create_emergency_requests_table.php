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
        Schema::create('emergency_requests', function (Blueprint $table) {
            $table->id();

            $table->string('sender');
            $table->string('mobile')->nullable();
            $table->text('raw_message');
            $table->string('location')->nullable();
            $table->string('urgency', 20)->default('MEDIUM');
            $table->json('needs')->nullable();
            $table->text('summary')->nullable();

            $table->string('status', 20)->default('PENDING');

            $table->foreignId('assigned_to')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();

            $table->timestamp('assisted_at')->nullable();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('emergency_requests');
    }
};
