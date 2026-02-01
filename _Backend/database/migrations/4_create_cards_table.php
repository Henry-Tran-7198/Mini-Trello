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
        Schema::create('cards', function (Blueprint $table) {
            $table->id();

            $table->foreignId('board_id')
                ->constrained('boards')
                ->cascadeOnDelete();

            $table->foreignId('column_id')
                ->constrained('columns')
                ->cascadeOnDelete();

            $table->string('title');
            $table->text('description')->nullable(); // mock-data cho phép null
            $table->string('cover')->nullable();      // 🔥 FIX CHÍNH Ở ĐÂY
            $table->integer('orderCard');

            $table->boolean('_destroy')->default(false);

            $table->timestamp('createdAt')->useCurrent();
            $table->timestamp('updatedAt')->nullable();
        });

    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('cards');
    }
};
