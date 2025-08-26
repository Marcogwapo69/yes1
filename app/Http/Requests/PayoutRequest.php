<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class PayoutRequest extends FormRequest
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
            'channel_code' => 'required|string',
            'account_number' => 'required|string',
            'account_holder_name' => 'required|string',
            'amount' => 'required|integer',
        ];
    }

    /**
     * Custom error messages.
     */
    public function messages(): array
    {
        return [
            'channel_code.required' => 'Please specify the destination bank.',
            'account_number.required' => 'Please specify your bank account number.',
            'account_holder_name.required' => 'Please enter the name of the account holder.',
            'amount.required' => 'Specify the amount for your payout.',
            'amount.integer' => 'The payout field should be a number.',
        ];
    }
}
