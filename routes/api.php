<?php

use App\Http\Controllers\Admin\CourseController;
use App\Http\Controllers\Admin\CourseClassificationController;
use App\Http\Controllers\Admin\CourseMaterialController;
use App\Http\Controllers\Admin\CourseSectionController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\InstructorController;
use App\Http\Controllers\Admin\StudentController;
use App\Http\Controllers\Admin\UnitController;
use App\Http\Controllers\Admin\SubUnitController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\Student\StudentCourseController;
use Illuminate\Support\Facades\Route;

Route::prefix('auth')->group(function (): void {
    Route::post('login', [AuthController::class, 'login'])->name('auth.login');
    Route::post('logout', [AuthController::class, 'logout'])->middleware('auth.token')->name('auth.logout');
    Route::get('me', [AuthController::class, 'me'])->middleware('auth.token')->name('auth.me');
});

Route::prefix('student')
    ->middleware(['auth.token'])
    ->group(function (): void {
        Route::get('courses', [StudentCourseController::class, 'index'])->name('student.courses.index');
        Route::post('courses/{course:slug}/enroll', [StudentCourseController::class, 'enroll'])->name('student.courses.enroll');
        Route::get('my-courses', [StudentCourseController::class, 'myCourses'])->name('student.my-courses.index');
        Route::get('my-courses/{course:slug}', [StudentCourseController::class, 'showMyCourse'])->name('student.my-courses.show');
    });

Route::prefix('admin')
    ->name('admin.')
    ->middleware(['api'])
    ->group(function (): void {
        Route::get('dashboard/metrics', [DashboardController::class, 'metrics'])->name('dashboard.metrics');

        Route::apiResource('courses', CourseController::class)->scoped([
            'course' => 'slug',
        ]);

        Route::apiResource('course-classifications', CourseClassificationController::class)->except(['create', 'edit']);
        Route::apiResource('courses.sections', CourseSectionController::class)
            ->except(['create', 'edit'])
            ->scoped([
                'course' => 'slug',
            ])
            ->shallow();
        Route::apiResource('sections.materials', CourseMaterialController::class)->except(['create', 'edit'])->shallow();
        Route::apiResource('students', StudentController::class)->except(['create', 'edit']);
        Route::apiResource('instructors', InstructorController::class)->except(['create', 'edit']);
        Route::apiResource('units', UnitController::class)->except(['create', 'edit']);
        Route::apiResource('sub-units', SubUnitController::class)->except(['create', 'edit']);
    });
