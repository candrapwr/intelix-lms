<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreCourseMaterialRequest;
use App\Http\Requests\Admin\UpdateCourseMaterialRequest;
use App\Http\Resources\CourseMaterialResource;
use App\Models\CourseMaterial;
use App\Models\CourseSection;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\ResourceCollection;
use Illuminate\Support\Facades\Storage;

class CourseMaterialController extends Controller
{
    public function index(CourseSection $section): ResourceCollection
    {
        $materials = $section->materials()
            ->orderBy('sort_order')
            ->orderBy('created_at')
            ->get();

        return CourseMaterialResource::collection($materials);
    }

    public function store(StoreCourseMaterialRequest $request, CourseSection $section): JsonResponse
    {
        $payload = $request->validated();
        $file = $request->file('file');
        $disk = config('filesystems.default', 'public');
        $path = $file->store('course-materials', $disk);

        if (! array_key_exists('sort_order', $payload) || $payload['sort_order'] === null) {
            $payload['sort_order'] = (int) $section->materials()->max('sort_order') + 1;
        } else {
            $payload['sort_order'] = (int) $payload['sort_order'];
        }

        $material = $section->materials()->create([
            'title' => $payload['title'] ?? $file->getClientOriginalName(),
            'description' => $payload['description'] ?? null,
            'sort_order' => $payload['sort_order'],
            'file_path' => $path,
            'file_name' => $file->getClientOriginalName(),
            'mime_type' => $file->getMimeType(),
            'file_size' => $file->getSize(),
            'storage_disk' => $disk,
        ]);

        return (new CourseMaterialResource($material))
            ->response()
            ->setStatusCode(201);
    }

    public function show(CourseMaterial $material): CourseMaterialResource
    {
        return new CourseMaterialResource($material);
    }

    public function update(UpdateCourseMaterialRequest $request, CourseMaterial $material): CourseMaterialResource
    {
        $payload = $request->validated();

        if ($request->hasFile('file')) {
            $disk = $material->storage_disk ?: config('filesystems.default', 'public');
            Storage::disk($disk)->delete($material->file_path);

            $file = $request->file('file');
            $path = $file->store('course-materials', $disk);

            $material->fill([
                'file_path' => $path,
                'file_name' => $file->getClientOriginalName(),
                'mime_type' => $file->getMimeType(),
                'file_size' => $file->getSize(),
                'storage_disk' => $disk,
            ]);
        }

        if (array_key_exists('title', $payload)) {
            $material->title = $payload['title'];
        }

        if (array_key_exists('description', $payload)) {
            $material->description = $payload['description'];
        }

        if (array_key_exists('sort_order', $payload)) {
            $material->sort_order = $payload['sort_order'] !== null ? (int) $payload['sort_order'] : null;
        }

        $material->save();

        return new CourseMaterialResource($material->refresh());
    }

    public function destroy(CourseMaterial $material): JsonResponse
    {
        $material->delete();

        return response()->json(null, 204);
    }
}
