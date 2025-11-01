<?php

use App\Http\Controllers\Admin\CourseController;
use App\Http\Controllers\Admin\CourseClassificationController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\InstructorController;
use App\Http\Controllers\Admin\StudentController;
use App\Http\Controllers\Admin\UnitController;
use App\Http\Controllers\Admin\SubUnitController;
use Illuminate\Support\Facades\Route;

Route::prefix('admin')
    ->name('admin.')
    ->middleware(['api'])
    ->group(function (): void {
        Route::get('dashboard/metrics', [DashboardController::class, 'metrics'])->name('dashboard.metrics');

        Route::apiResource('courses', CourseController::class)->scoped([
            'course' => 'slug',
        ]);

        Route::apiResource('course-classifications', CourseClassificationController::class)->except(['create', 'edit']);
        Route::apiResource('students', StudentController::class)->except(['create', 'edit']);
        Route::apiResource('instructors', InstructorController::class)->except(['create', 'edit']);
        Route::apiResource('units', UnitController::class)->except(['create', 'edit']);
        Route::apiResource('sub-units', SubUnitController::class)->except(['create', 'edit']);
    });
