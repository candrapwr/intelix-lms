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
        Schema::create('course_quiz_attempt_answers', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('course_quiz_attempt_id')->constrained()->cascadeOnDelete();
            $table->foreignId('course_quiz_id')->constrained()->cascadeOnDelete();
            $table->foreignId('course_quiz_option_id')->nullable()->constrained()->nullOnDelete();
            $table->boolean('is_correct')->default(false);
            $table->timestamps();

            $table->unique(['course_quiz_attempt_id', 'course_quiz_id'], 'quiz_attempt_answer_unique');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('course_quiz_attempt_answers');
    }
};

