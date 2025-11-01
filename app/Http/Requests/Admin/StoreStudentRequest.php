<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use App\Models\SubUnit;

class StoreStudentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', Rule::unique('users', 'email')],
            'password' => ['required', 'string', 'min:8'],
            'phone' => ['nullable', 'string', 'max:25'],
            'unit_id' => ['nullable', 'exists:units,id'],
            'sub_unit_id' => ['nullable', 'exists:sub_units,id'],
            'profile' => ['nullable', 'array'],
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
