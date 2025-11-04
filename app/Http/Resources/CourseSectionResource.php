<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CourseSectionResource extends JsonResource
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
            'course_id' => $this->course_id,
            'title' => $this->title,
            'summary' => $this->summary,
            'sort_order' => $this->sort_order,
            'materials' => CourseMaterialResource::collection($this->whenLoaded('materials')),
            'quizzes' => CourseQuizResource::collection($this->whenLoaded('quizzes')),
            'quiz_attempt' => $this->whenLoaded('quizAttempts', function () {
                $attempt = $this->quizAttempts->first();

                return $attempt ? new CourseQuizAttemptResource($attempt) : null;
            }),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
