<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Http\Resources\Student\StudentCourseDetailResource;
use App\Http\Resources\Student\StudentCourseResource;
use App\Models\Course;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\ResourceCollection;

class StudentCourseController extends Controller
{
    public function index(Request $request): ResourceCollection
    {
        $student = $request->user();

        $courses = Course::query()
            ->where('status', 'published')
            ->with([
                'classification:id,name',
                'enrollments' => fn ($query) => $query->where('user_id', $student->id),
            ])
            ->withCount(['sections', 'modules'])
            ->orderBy('title')
            ->get();

        return StudentCourseResource::collection($courses);
    }

    public function enroll(Request $request, Course $course): JsonResponse
    {
        $student = $request->user();

        if ($course->status !== 'published') {
            return response()->json([
                'message' => 'Kursus belum tersedia untuk pendaftaran.',
            ], 422);
        }

        $alreadyEnrolled = $course->enrollments()
            ->where('user_id', $student->id)
            ->exists();

        if ($alreadyEnrolled) {
            return response()->json([
                'message' => 'Anda sudah terdaftar pada kursus ini.',
            ], 409);
        }

        $course->enrollments()->create([
            'user_id' => $student->id,
            'status' => 'active',
            'progress_percentage' => 0,
            'enrolled_at' => now(),
        ]);

        $course->load([
            'classification:id,name',
            'enrollments' => fn ($query) => $query->where('user_id', $student->id),
        ])->loadCount(['sections', 'modules']);

        return (new StudentCourseResource($course))->response()->setStatusCode(201);
    }

    public function myCourses(Request $request): ResourceCollection
    {
        $student = $request->user();

        $courses = Course::query()
            ->whereHas('enrollments', fn ($query) => $query->where('user_id', $student->id))
            ->with([
                'classification:id,name',
                'enrollments' => fn ($query) => $query->where('user_id', $student->id),
            ])
            ->withCount(['sections', 'modules'])
            ->orderBy('title')
            ->get();

        return StudentCourseResource::collection($courses);
    }

    public function showMyCourse(Request $request, Course $course): StudentCourseDetailResource
    {
        $student = $request->user();

        $course->load([
            'classification:id,name',
            'sections.materials',
            'sections.quizzes.options',
            'sections.quizAttempts' => fn ($query) => $query
                ->where('user_id', $student->id)
                ->with('answers'),
            'enrollments' => fn ($query) => $query->where('user_id', $student->id),
        ])->loadCount(['sections', 'modules']);

        $enrollment = $course->enrollments->first();

        if (! $enrollment) {
            abort(404, 'Kursus tidak ditemukan atau belum Anda ikuti.');
        }

        $enrollment->forceFill([
            'last_accessed_at' => now(),
        ])->save();

        return new StudentCourseDetailResource($course);
    }
}
