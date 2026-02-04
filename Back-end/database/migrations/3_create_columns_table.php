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
        Schema::create('columns', function (Blueprint $table) {
            $table->id();
            $table->foreignId('board_id')->constrained('boards');
            $table->string('title');
            $table->integer('orderColumn');
            $table->timestamp('createdAt')->useCurrent();
            $table->timestamp('updatedAt')->nullable();
            $table->boolean('_destroy');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('columns');
    }
};
