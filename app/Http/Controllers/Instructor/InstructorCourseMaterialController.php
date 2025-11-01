<?php

namespace App\Http\Controllers\Instructor;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreCourseMaterialRequest;
use App\Http\Requests\Admin\UpdateCourseMaterialRequest;
use App\Http\Resources\CourseMaterialResource;
use App\Models\CourseMaterial;
use App\Models\CourseSection;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class InstructorCourseMaterialController extends Controller
{
    public function store(StoreCourseMaterialRequest $request, CourseSection $section): JsonResponse
    {
        $instructor = $request->user();

        abort_unless($instructor && $instructor->role === 'instructor', 403);
        $this->ensureSectionOwnership($section, $instructor->id);

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

    public function update(UpdateCourseMaterialRequest $request, CourseMaterial $material): CourseMaterialResource
    {
        $instructor = $request->user();

        abort_unless($instructor && $instructor->role === 'instructor', 403);
        $this->ensureMaterialOwnership($material, $instructor->id);

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

    public function destroy(Request $request, CourseMaterial $material): JsonResponse
    {
        $instructor = $request->user();

        abort_unless($instructor && $instructor->role === 'instructor', 403);
        $this->ensureMaterialOwnership($material, $instructor->id);

        $material->delete();

        return response()->json(null, 204);
    }

    private function ensureSectionOwnership(CourseSection $section, int $instructorId): void
    {
        $section->loadMissing('course');

        abort_unless(optional($section->course)->instructor_id === $instructorId, 404);
    }

    private function ensureMaterialOwnership(CourseMaterial $material, int $instructorId): void
    {
        $material->loadMissing('section.course');

        $course = optional($material->section)->course;

        abort_unless(optional($course)->instructor_id === $instructorId, 404);
    }
}
