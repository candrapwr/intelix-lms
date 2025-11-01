<?php

namespace App\Http\Resources\Instructor;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class InstructorCourseResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'slug' => $this->slug,
            'title' => $this->title,
            'short_description' => $this->short_description,
            'status' => $this->status,
            'classification' => $this->whenLoaded('classification', function () {
                return [
                    'id' => $this->classification->id,
                    'name' => $this->classification->name,
                ];
            }),
            'sections_count' => $this->whenCounted('sections', fn () => (int) $this->sections_count),
            'enrollments_count' => $this->whenCounted('enrollments', fn () => (int) $this->enrollments_count),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
