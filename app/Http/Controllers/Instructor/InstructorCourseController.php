<?php

namespace App\Http\Controllers\Instructor;

use App\Http\Controllers\Controller;
use App\Http\Resources\Instructor\InstructorCourseDetailResource;
use App\Http\Resources\Instructor\InstructorCourseResource;
use App\Models\Course;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class InstructorCourseController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $instructor = $request->user();

        abort_unless($instructor && $instructor->role === 'instructor', 403);

        $courses = Course::query()
            ->where('instructor_id', $instructor->id)
            ->with(['classification:id,name'])
            ->withCount(['sections', 'enrollments'])
            ->orderBy('title')
            ->get();

        return InstructorCourseResource::collection($courses);
    }

    public function show(Request $request, Course $course): InstructorCourseDetailResource
    {
        $instructor = $request->user();

        abort_unless($instructor && $instructor->role === 'instructor', 403);
        abort_unless($course->instructor_id === $instructor->id, 404);

        $course->load([
            'classification:id,name',
            'sections.materials',
        ])->loadCount(['sections', 'enrollments']);

        return new InstructorCourseDetailResource($course);
    }
}
