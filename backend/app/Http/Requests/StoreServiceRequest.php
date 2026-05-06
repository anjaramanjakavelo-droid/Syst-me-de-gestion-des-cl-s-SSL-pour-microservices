<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreServiceRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() && $this->user()->role === 'admin';
    }

    public function rules(): array
    {
        $serviceId = $this->route('service');

        return [
            'nom' => 'required|string|max:255|unique:services,nom'.($serviceId ? ','.$serviceId : ''),
            'description' => 'nullable|string|max:1000',
        ];
    }

    public function messages(): array
    {
        return [
            'nom.required' => 'Le nom du service est requis.',
            'nom.unique' => 'Ce nom de service existe déjà.',
            'nom.max' => 'Le nom ne doit pas dépasser 255 caractères.',
            'description.max' => 'La description ne doit pas dépasser 1000 caractères.',
        ];
    }
}
