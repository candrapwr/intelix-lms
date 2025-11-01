<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreCourseSectionRequest;
use App\Http\Requests\Admin\UpdateCourseSectionRequest;
use App\Http\Resources\CourseSectionResource;
use App\Models\Course;
use App\Models\CourseSection;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\ResourceCollection;

class CourseSectionController extends Controller
{
    public function index(Course $course): ResourceCollection
    {
        $sections = $course->sections()
            ->with('materials')
            ->orderBy('sort_order')
            ->orderBy('created_at')
            ->get();

        return CourseSectionResource::collection($sections);
    }

    public function store(StoreCourseSectionRequest $request, Course $course): JsonResponse
    {
        $payload = $request->validated();

        if (! array_key_exists('sort_order', $payload) || $payload['sort_order'] === null) {
            $payload['sort_order'] = (int) $course->sections()->max('sort_order') + 1;
        } else {
            $payload['sort_order'] = (int) $payload['sort_order'];
        }

        $section = $course->sections()->create($payload);

        return (new CourseSectionResource($section->load('materials')))
            ->response()
            ->setStatusCode(201);
    }

    public function show(CourseSection $section): CourseSectionResource
    {
        return new CourseSectionResource($section->load('materials'));
    }

    public function update(UpdateCourseSectionRequest $request, CourseSection $section): CourseSectionResource
    {
        $data = $request->validated();

        if (array_key_exists('sort_order', $data)) {
            $data['sort_order'] = $data['sort_order'] !== null ? (int) $data['sort_order'] : null;
        }

        $section->update($data);

        return new CourseSectionResource($section->refresh()->load('materials'));
    }

    public function destroy(CourseSection $section): JsonResponse
    {
        $section->delete();

        return response()->json(null, 204);
    }
}
