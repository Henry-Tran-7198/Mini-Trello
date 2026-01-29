<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ProfileRequest extends FormRequest
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
        $userId = $this->attributes->get('auth_user')?->id ?? $this->route('id') ?? null;        
        return [
            'email'    => 'sometimes|email|unique:users,email,' . $userId,
            'username' => 'sometimes|min:3|unique:users,username,' . $userId,
            'password' => 'sometimes|min:6|confirmed',
            'avatar'   => 'sometimes|image|max:2048',  // add sometimes for optional file
        ];
    }

    public function messages()
    {
        return [
            'email.email' => 'This field must be an email',
            'email.unique' => 'Email must be unique',
            'username.min' => 'Username must contain at least 3 characters',
            'username.unique' => 'Username must be unique',
            'password.min' => 'Password must contain at least 6 characters',
            'password.confirmed' => 'Passwords do not match',
            'avatar.image' => 'Avatar must be an image',
            'avatar.max' => 'Avatar too large (max 2MB)'
        ];
    }
}
