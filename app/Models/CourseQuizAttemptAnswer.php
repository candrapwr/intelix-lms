<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CourseQuizAttemptAnswer extends Model
{
    use HasFactory;

    protected $fillable = [
        'course_quiz_attempt_id',
        'course_quiz_id',
        'course_quiz_option_id',
        'is_correct',
    ];

    protected $casts = [
        'is_correct' => 'boolean',
    ];

    public function attempt(): BelongsTo
    {
        return $this->belongsTo(CourseQuizAttempt::class, 'course_quiz_attempt_id');
    }

    public function quiz(): BelongsTo
    {
        return $this->belongsTo(CourseQuiz::class, 'course_quiz_id');
    }

    public function option(): BelongsTo
    {
        return $this->belongsTo(CourseQuizOption::class, 'course_quiz_option_id');
    }
}

