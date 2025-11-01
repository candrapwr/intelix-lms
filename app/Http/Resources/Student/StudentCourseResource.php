<?php

namespace App\Http\Resources\Student;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class StudentCourseResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $enrollment = $this->enrollments->first();

        return [
            'id' => $this->id,
            'slug' => $this->slug,
            'title' => $this->title,
            'short_description' => $this->short_description,
            'classification' => $this->whenLoaded('classification', function (): array {
                return [
                    'id' => $this->classification->id,
                    'name' => $this->classification->name,
                ];
            }),
            'status' => $this->status,
            'duration_minutes' => $this->duration_minutes,
            'sections_count' => $this->when(isset($this->sections_count), $this->sections_count),
            'modules_count' => $this->when(isset($this->modules_count), $this->modules_count),
            'is_enrolled' => (bool) $enrollment,
            'enrollment' => $enrollment ? [
                'status' => $enrollment->status,
                'progress_percentage' => $enrollment->progress_percentage,
                'enrolled_at' => $enrollment->enrolled_at,
                'last_accessed_at' => $enrollment->last_accessed_at,
            ] : null,
        ];
    }
}
