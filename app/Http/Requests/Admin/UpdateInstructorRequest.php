<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateInstructorRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $instructorId = $this->route('instructor');
        $instructorId = is_object($instructorId) ? $instructorId->id : $instructorId;

        return [
            'name' => ['sometimes', 'required', 'string', 'max:255'],
            'email' => [
                'sometimes',
                'required',
                'email',
                'max:255',
                Rule::unique('users', 'email')->ignore($instructorId),
            ],
            'password' => ['nullable', 'string', 'min:8'],
            'phone' => ['sometimes', 'nullable', 'string', 'max:25'],
            'unit_id' => ['sometimes', 'nullable', 'exists:units,id'],
            'profile' => ['sometimes', 'nullable', 'array'],
            'profile.expertise' => ['required_with:profile', 'string', 'max:255'],
            'profile.bio' => ['nullable', 'string'],
            'profile.socials' => ['nullable', 'array'],
        ];
    }
}
