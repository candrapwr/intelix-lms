<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreCourseRequest;
use App\Http\Requests\Admin\UpdateCourseRequest;
use App\Http\Resources\CourseResource;
use App\Models\Course;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\ResourceCollection;

class CourseController extends Controller
{
    public function index(): ResourceCollection
    {
        $query = Course::query()
            ->with(['category', 'instructor', 'classification'])
            ->withCount(['enrollments', 'students'])
            ->latest();

        if ($status = request()->query('status')) {
            $query->where('status', $status);
        }

        if ($categoryId = request()->query('category_id')) {
            $query->where('category_id', $categoryId);
        }

        if ($classificationId = request()->query('classification_id')) {
            $query->where('classification_id', $classificationId);
        }

        if ($search = request()->query('search')) {
            $query->where('title', 'ilike', "%{$search}%");
        }

        return CourseResource::collection(
            $query->paginate(perPage: request()->integer('per_page', 15))
        );
    }

    public function store(StoreCourseRequest $request): JsonResponse
    {
        $course = Course::create($request->validated());

        return (new CourseResource($course->load(['category', 'instructor', 'classification'])->loadCount(['enrollments', 'students'])))
            ->response()
            ->setStatusCode(201);
    }

    public function show(Course $course): CourseResource
    {
        $course->load([
            'category',
            'instructor',
            'classification',
            'sections.materials',
            'modules.lessons',
            'students',
        ])
            ->loadCount(['enrollments', 'students']);

        return new CourseResource($course);
    }

    public function update(UpdateCourseRequest $request, Course $course): CourseResource
    {
        $course->update($request->validated());

        return new CourseResource($course->refresh()->load(['category', 'instructor', 'classification'])->loadCount(['enrollments', 'students']));
    }

    public function destroy(Course $course): JsonResponse
    {
        $course->delete();

        return response()->json(null, 204);
    }
}
