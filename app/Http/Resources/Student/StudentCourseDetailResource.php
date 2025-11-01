<?php

namespace App\Http\Resources\Student;

use App\Http\Resources\CourseSectionResource;
use Illuminate\Http\Request;

class StudentCourseDetailResource extends StudentCourseResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $data = parent::toArray($request);

        $data['description'] = $this->description;
        $data['sections'] = CourseSectionResource::collection(
            $this->whenLoaded('sections')
        );
        $data['materials_count'] = $this->whenLoaded('sections', function () {
            return $this->sections->sum(fn ($section) => $section->materials->count());
        });

        return $data;
    }
}
