<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CheckPaymentLinkRequest extends FormRequest
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
        return [
            'amount' => 'required|numeric',
            'auth' => 'required|string',
            'card_number' => 'required|numeric',
            'card_exp_month' => 'required|numeric',
            'card_exp_year' => 'required|numeric',
            'card_cvn' => 'required|numeric',
        ];
    }
}
