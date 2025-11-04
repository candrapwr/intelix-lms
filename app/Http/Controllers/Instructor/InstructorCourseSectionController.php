<?php

namespace App\Http\Controllers\Instructor;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreCourseSectionRequest;
use App\Http\Requests\Admin\UpdateCourseSectionRequest;
use App\Http\Resources\CourseSectionResource;
use App\Models\Course;
use App\Models\CourseSection;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class InstructorCourseSectionController extends Controller
{
    public function store(StoreCourseSectionRequest $request, Course $course): JsonResponse
    {
        $instructor = $request->user();

        abort_unless($instructor && $instructor->role === 'instructor', 403);
        abort_unless($course->instructor_id === $instructor->id, 404);

        $payload = $request->validated();

        if (! array_key_exists('sort_order', $payload) || $payload['sort_order'] === null) {
            $payload['sort_order'] = (int) $course->sections()->max('sort_order') + 1;
        } else {
            $payload['sort_order'] = (int) $payload['sort_order'];
        }

        $section = $course->sections()->create($payload);

        return (new CourseSectionResource($section->load(['materials', 'quizzes.options'])))
            ->response()
            ->setStatusCode(201);
    }

    public function update(UpdateCourseSectionRequest $request, CourseSection $section): CourseSectionResource
    {
        $instructor = $request->user();

        abort_unless($instructor && $instructor->role === 'instructor', 403);
        $this->ensureSectionOwnership($section, $instructor->id);

        $data = $request->validated();

        if (array_key_exists('sort_order', $data)) {
            $data['sort_order'] = $data['sort_order'] !== null ? (int) $data['sort_order'] : null;
        }

        $section->update($data);

        return new CourseSectionResource($section->refresh()->load(['materials', 'quizzes.options']));
    }

    public function destroy(Request $request, CourseSection $section): JsonResponse
    {
        $instructor = $request->user();

        abort_unless($instructor && $instructor->role === 'instructor', 403);
        $this->ensureSectionOwnership($section, $instructor->id);

        $section->delete();

        return response()->json(null, 204);
    }

    private function ensureSectionOwnership(CourseSection $section, int $instructorId): void
    {
        $section->loadMissing('course');

        abort_unless(optional($section->course)->instructor_id === $instructorId, 404);
    }
}
