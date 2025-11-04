<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class CourseSection extends Model
{
    use HasFactory;

    protected $fillable = [
        'course_id',
        'title',
        'summary',
        'sort_order',
    ];

    public function course(): BelongsTo
    {
        return $this->belongsTo(Course::class);
    }

    public function materials(): HasMany
    {
        return $this->hasMany(CourseMaterial::class)->orderBy('sort_order')->orderBy('created_at');
    }

    public function quizzes(): HasMany
    {
        return $this->hasMany(CourseQuiz::class)->orderBy('sort_order')->orderBy('created_at');
    }

    public function quizAttempts(): HasMany
    {
        return $this->hasMany(CourseQuizAttempt::class);
    }
}
