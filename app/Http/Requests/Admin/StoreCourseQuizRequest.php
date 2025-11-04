<?php

namespace App\Http\Requests\Admin;

use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\ValidationException;

class StoreCourseQuizRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'question' => ['required', 'string', 'max:500'],
            'explanation' => ['nullable', 'string'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
            'options' => ['required', 'array', 'min:2', 'max:10'],
            'options.*.label' => ['nullable', 'string', 'max:10'],
            'options.*.text' => ['required', 'string', 'max:255'],
            'options.*.is_correct' => ['required', 'boolean'],
        ];
    }

    protected function passedValidation(): void
    {
        $options = collect($this->validated()['options'] ?? []);
        $hasCorrect = $options->contains(fn ($option) => ($option['is_correct'] ?? false) === true);

        if (! $hasCorrect) {
            throw ValidationException::withMessages([
                'options' => ['Setidaknya satu pilihan harus ditandai sebagai jawaban benar.'],
            ]);
        }
    }
}
