<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreInstructorRequest extends FormRequest
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
            'profile' => ['nullable', 'array'],
            'profile.expertise' => ['required_with:profile', 'string', 'max:255'],
            'profile.bio' => ['nullable', 'string'],
            'profile.socials' => ['nullable', 'array'],
        ];
    }
}
