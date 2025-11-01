<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\Enrollment;
use App\Models\User;
use Illuminate\Http\JsonResponse;

class DashboardController extends Controller
{
    public function metrics(): JsonResponse
    {
        $totalStudents = User::query()->where('role', 'student')->count();
        $activeInstructors = User::query()->where('role', 'instructor')->count();
        $activeCourses = Course::query()->where('status', 'published')->count();
        $completedEnrollments = Enrollment::query()->where('status', 'completed')->count();
        $totalEnrollments = Enrollment::query()->count();

        $completionRate = $totalEnrollments > 0
            ? round(($completedEnrollments / $totalEnrollments) * 100, 1)
            : 0;

        return response()->json([
            'totals' => [
                'students' => $totalStudents,
                'courses' => $activeCourses,
                'instructors' => $activeInstructors,
                'completion_rate' => $completionRate,
            ],
            'enrollments' => [
                'active' => $totalEnrollments - $completedEnrollments,
                'completed' => $completedEnrollments,
            ],
        ]);
    }
}
