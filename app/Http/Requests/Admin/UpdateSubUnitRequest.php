<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateSubUnitRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $subUnit = $this->route('sub_unit');
        $subUnitId = is_object($subUnit) ? $subUnit->id : $subUnit;

        return [
            'unit_id' => ['sometimes', 'required', 'exists:units,id'],
            'name' => ['sometimes', 'required', 'string', 'max:150'],
            'code' => [
                'sometimes',
                'nullable',
                'string',
                'max:50',
                Rule::unique('sub_units', 'code')->ignore($subUnitId),
            ],
            'description' => ['sometimes', 'nullable', 'string'],
            'is_active' => ['sometimes', 'nullable', 'boolean'],
        ];
    }
}
