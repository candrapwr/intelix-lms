<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class UpdateCourseRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $courseId = $this->route('course');
        $courseId = is_object($courseId) ? $courseId->id : $courseId;

        return [
            'title' => ['sometimes', 'required', 'string', 'max:255'],
            'slug' => [
                'sometimes',
                'string',
                'max:255',
                Rule::unique('courses', 'slug')->ignore($courseId),
            ],
            'category_id' => ['sometimes', 'nullable', 'exists:categories,id'],
            'classification_id' => ['sometimes', 'required', 'exists:course_classifications,id'],
            'instructor_id' => ['sometimes', 'nullable', 'exists:users,id'],
            'short_description' => ['sometimes', 'nullable', 'string', 'max:500'],
            'description' => ['sometimes', 'nullable', 'string'],
            'status' => ['sometimes', 'required', 'in:draft,published,archived'],
            'duration_minutes' => ['sometimes', 'nullable', 'integer', 'min:0'],
            'price' => ['sometimes', 'nullable', 'numeric', 'min:0'],
            'published_at' => ['sometimes', 'nullable', 'date'],
        ];
    }

    protected function prepareForValidation(): void
    {
        if (! $this->filled('slug') && $this->filled('title')) {
            $this->merge([
                'slug' => Str::slug($this->string('title')->value()),
            ]);
        }
    }
}
