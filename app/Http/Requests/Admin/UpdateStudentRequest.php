<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use App\Models\SubUnit;

class UpdateStudentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $studentId = $this->route('student');
        $studentId = is_object($studentId) ? $studentId->id : $studentId;

        return [
            'name' => ['sometimes', 'required', 'string', 'max:255'],
            'email' => [
                'sometimes',
                'required',
                'email',
                'max:255',
                Rule::unique('users', 'email')->ignore($studentId),
            ],
            'password' => ['nullable', 'string', 'min:8'],
            'phone' => ['sometimes', 'nullable', 'string', 'max:25'],
            'unit_id' => ['sometimes', 'nullable', 'exists:units,id'],
            'sub_unit_id' => ['sometimes', 'nullable', 'exists:sub_units,id'],
            'profile' => ['sometimes', 'nullable', 'array'],
        ];
    }

    protected function prepareForValidation(): void
    {
        if ($this->filled('sub_unit_id') && ! $this->filled('unit_id')) {
            $unitId = SubUnit::query()->find($this->input('sub_unit_id'))?->unit_id;
            if ($unitId) {
                $this->merge(['unit_id' => $unitId]);
            }
        }
    }

    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            $subUnitId = $this->input('sub_unit_id');
            $unitId = $this->input('unit_id');

            if ($subUnitId && $unitId) {
                $subUnit = SubUnit::query()->find($subUnitId);
                if ($subUnit && (int) $unitId !== $subUnit->unit_id) {
                    $validator->errors()->add('sub_unit_id', 'Sub unit tidak sesuai dengan unit yang dipilih.');
                }
            }
        });
    }
}
