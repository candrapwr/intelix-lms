<?php

namespace App\Http\Resources\Instructor;

use App\Http\Resources\CourseSectionResource;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class InstructorCourseDetailResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $sections = $this->sections ?? collect();
        $materialsTotal = $sections->sum(function ($section) {
            return $section->materials?->count() ?? 0;
        });

        return [
            'id' => $this->id,
            'slug' => $this->slug,
            'title' => $this->title,
            'short_description' => $this->short_description,
            'description' => $this->description,
            'status' => $this->status,
            'classification' => $this->whenLoaded('classification', function () {
                return [
                    'id' => $this->classification->id,
                    'name' => $this->classification->name,
                ];
            }),
            'sections' => CourseSectionResource::collection($sections),
            'statistics' => [
                'sections' => $sections->count(),
                'materials' => $materialsTotal,
                'enrollments' => $this->whenCounted('enrollments', fn () => (int) $this->enrollments_count),
            ],
            'published_at' => $this->published_at,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
