<?php

namespace App\Services\Transaction;

use GlennRaya\Xendivel\Xendivel;
use Illuminate\Http\Client\Response;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;

class PaymentCodeService
{
    /**
     * Generate custom payment code for a sub-account.
     *
     * @return mixed
     */
    public function generateCustomPaymentCode(): ?string
    {
        $account_type = Auth::user()->business->account_type;
        $business_id = Auth::user()->business->business_id;

        if (
            config('payment.enable_custom_payment_code') &&
            $account_type === 'sub_account' &&
            in_array($business_id, config('payment.custom_payment_code_consumer', []))
        ) {
            return Str::random(8).config('payment.payment_code_prefix');
        }

        return null;
    }

    /**
     * Create Xendit payment code for over-the-counter transactions.
     *
     * @param  array  $data  - Data needed to create a payment code with Xendit.
     * @return Illuminate\Http\Client\Response
     */
    public function createPaymentCode(array $data): Response
    {
        return Xendivel::otc()->createPaymentCode($data);
    }
}
