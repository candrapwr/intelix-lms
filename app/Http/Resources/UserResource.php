<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
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
            'name' => $this->name,
            'email' => $this->email,
            'role' => $this->role,
            'phone' => $this->phone,
            'profile' => $this->profile,
            'unit' => $this->whenLoaded('unit', function () {
                return $this->unit ? [
                    'id' => $this->unit->id,
                    'name' => $this->unit->name,
                    'code' => $this->unit->code,
                ] : null;
            }),
            'sub_unit' => $this->whenLoaded('subUnit', function () {
                return $this->subUnit ? [
                    'id' => $this->subUnit->id,
                    'name' => $this->subUnit->name,
                    'code' => $this->subUnit->code,
                    'unit_id' => $this->subUnit->unit_id,
                ] : null;
            }),
            'email_verified_at' => $this->email_verified_at,
            'teaching_courses' => CourseResource::collection(
                $this->whenLoaded('teachingCourses', fn () => $this->teachingCourses)
            ),
            'enrollments' => $this->whenLoaded('enrollments', function () {
                return $this->enrollments->map(fn ($enrollment) => [
                    'id' => $enrollment->id,
                    'status' => $enrollment->status,
                    'progress_percentage' => $enrollment->progress_percentage,
                    'course' => [
                        'id' => $enrollment->course?->id,
                        'title' => $enrollment->course?->title,
                        'slug' => $enrollment->course?->slug,
                    ],
                ]);
            }),
            'meta' => [
                'enrollments' => $this->whenCounted('enrollments', fn () => $this->enrollments_count),
                'teaching_courses' => $this->whenCounted('teachingCourses', fn () => $this->teaching_courses_count),
            ],
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
