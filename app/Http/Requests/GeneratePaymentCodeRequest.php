<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class GeneratePaymentCodeRequest extends FormRequest
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
            'payment_option' => [
                'required',
                Rule::in(['DP_PALAWAN', 'DP_MLHUILLIER', 'DP_ECPAY_LOAN', 'DP_ECPAY_SCHOOL']),
            ],
            'agent_name' => 'required|regex:/^[a-zA-Z\s\.\-]+$/',
            'agent_phone' => 'bail|required_if:is_send_commission,true',
            'commission' => 'required_if:is_send_commission,true',
            'name' => 'required|regex:/^[a-zA-Z\s\.\-]+$/',
            'amount' => 'required|numeric|gte:50',
            'is_single_use' => 'required|boolean',
        ];
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation()
    {
        if (! Auth::user()->business) {
            throw ValidationException::withMessages([
                'no_business_id' => ["This account is not yet a business partner. You can't generate a payment code at the moment, please contact the admin."],
            ]);
        }
    }

    /**
     * Custom error messages.
     *
     * @return array<string>
     */
    public function messages()
    {
        return [
            'name.required' => 'The customer name is required.',
            'name.regex' => "The customer's name format is incorrect.",
            'agent_name.required' => 'The agent name is required.',
            'agent_phone.required' => 'The agent\'s phone number is required.',
            'agent_phone.required_if' => 'Enter the agent\'s phone number.',
            'agent_phone.numeric' => 'The agent\'s phone number should be numeric.',
            'agent_name.regex' => "The agent's name format is incorrect.",

            'commission.required_if' => 'Specify the amount of the commission.',
        ];
    }
}
