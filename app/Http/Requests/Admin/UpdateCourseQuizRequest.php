<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\ValidationException;

class UpdateCourseQuizRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'question' => ['sometimes', 'string', 'max:500'],
            'explanation' => ['sometimes', 'nullable', 'string'],
            'sort_order' => ['sometimes', 'nullable', 'integer', 'min:0'],
            'options' => ['sometimes', 'array', 'min:2', 'max:10'],
            'options.*.label' => ['nullable', 'string', 'max:10'],
            'options.*.text' => ['required_with:options', 'string', 'max:255'],
            'options.*.is_correct' => ['required_with:options', 'boolean'],
        ];
    }

    protected function passedValidation(): void
    {
        if (! $this->has('options')) {
            return;
        }

        $options = collect($this->validated()['options'] ?? []);
        $hasCorrect = $options->contains(fn ($option) => ($option['is_correct'] ?? false) === true);

        if (! $hasCorrect) {
            throw ValidationException::withMessages([
                'options' => ['Setidaknya satu pilihan harus ditandai sebagai jawaban benar.'],
            ]);
        }
    }
}

