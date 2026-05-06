<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreCertificatRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() && $this->user()->role === 'admin';
    }

    public function rules(): array
    {
        return [
            'service_id' => 'required|exists:services,id',
            'domain' => 'required|string|max:255',
            'days' => 'required|integer|min:1|max:3650',
        ];
    }

    public function messages(): array
    {
        return [
            'service_id.required' => 'Le service est requis.',
            'service_id.exists' => 'Le service sélectionné n\'existe pas.',
            'domain.required' => 'Le domaine est requis.',
            'domain.max' => 'Le domaine ne doit pas dépasser 255 caractères.',
            'days.required' => 'La période de validité est requise.',
            'days.integer' => 'La période de validité doit être un nombre entier.',
            'days.min' => 'La période de validité minimum est de 1 jour.',
            'days.max' => 'La période de validité maximum est de 3650 jours (10 ans).',
        ];
    }
}
