<?php

namespace App\Http\Requests\Student;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class SubmitSectionQuizRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'answers' => ['required', 'array', 'min:1'],
            'answers.*.quiz_id' => ['required', 'integer', 'distinct'],
            'answers.*.option_id' => ['required', 'integer'],
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator): void {
            $answers = collect($this->input('answers', []));

            if ($answers->isEmpty()) {
                return;
            }

            $missingOption = $answers->first(fn ($answer) => ! array_key_exists('option_id', $answer));

            if ($missingOption) {
                $validator->errors()->add('answers', 'Seluruh jawaban harus memiliki pilihan yang dipilih.');
            }
        });
    }
}

