<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CourseResource extends JsonResource
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
            'description' => $this->description,
            'status' => $this->status,
            'duration_minutes' => $this->duration_minutes,
            'lesson_count' => $this->lesson_count,
            'price' => $this->price,
            'published_at' => $this->published_at,
            'classification_id' => $this->classification_id,
            'classification' => $this->whenLoaded('classification', function () {
                return [
                    'id' => $this->classification->id,
                    'name' => $this->classification->name,
                ];
            }),
            'category' => $this->whenLoaded('category', function () {
                return [
                    'id' => $this->category->id,
                    'name' => $this->category->name,
                ];
            }),
            'instructor' => $this->whenLoaded('instructor', function () {
                return [
                    'id' => $this->instructor->id,
                    'name' => $this->instructor->name,
                    'email' => $this->instructor->email,
                ];
            }),
            'sections' => CourseSectionResource::collection($this->whenLoaded('sections')),
            'students' => $this->whenLoaded('students', function () {
                return $this->students->map(fn ($student) => [
                    'id' => $student->id,
                    'name' => $student->name,
                    'email' => $student->email,
                    'pivot' => [
                        'status' => $student->pivot->status,
                        'progress_percentage' => $student->pivot->progress_percentage,
                        'enrolled_at' => $student->pivot->enrolled_at,
                    ],
                ]);
            }),
            'stats' => [
                'enrollments' => $this->whenCounted('enrollments', fn () => $this->enrollments_count),
                'students' => $this->whenCounted('students', fn () => $this->students_count),
            ],
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
