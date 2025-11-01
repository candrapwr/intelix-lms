<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreCourseClassificationRequest;
use App\Http\Requests\Admin\UpdateCourseClassificationRequest;
use App\Http\Resources\CourseClassificationResource;
use App\Models\CourseClassification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\ResourceCollection;

class CourseClassificationController extends Controller
{
    public function index(): ResourceCollection
    {
        $classifications = CourseClassification::query()
            ->orderBy('sort_order')
            ->orderBy('name')
            ->get();

        return CourseClassificationResource::collection($classifications);
    }

    public function store(StoreCourseClassificationRequest $request): JsonResponse
    {
        $classification = CourseClassification::create($request->validated());

        return (new CourseClassificationResource($classification))
            ->response()
            ->setStatusCode(201);
    }

    public function show(CourseClassification $courseClassification): CourseClassificationResource
    {
        return new CourseClassificationResource($courseClassification);
    }

    public function update(UpdateCourseClassificationRequest $request, CourseClassification $courseClassification): CourseClassificationResource
    {
        $courseClassification->update($request->validated());

        return new CourseClassificationResource($courseClassification->refresh());
    }

    public function destroy(CourseClassification $courseClassification): JsonResponse
    {
        if ($courseClassification->courses()->exists()) {
            return response()->json([
                'message' => 'Klasifikasi tidak dapat dihapus karena masih digunakan pada kursus.',
            ], 422);
        }

        $courseClassification->delete();

        return response()->json(null, 204);
    }
}
