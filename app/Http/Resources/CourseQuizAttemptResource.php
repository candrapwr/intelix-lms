<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CourseQuizAttemptResource extends JsonResource
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
            'course_section_id' => $this->course_section_id,
            'total_questions' => $this->total_questions,
            'correct_answers' => $this->correct_answers,
            'submitted_at' => $this->submitted_at,
            'answers' => CourseQuizAttemptAnswerResource::collection($this->whenLoaded('answers')),
        ];
    }
}

