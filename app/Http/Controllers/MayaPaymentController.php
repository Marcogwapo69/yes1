<?php

namespace App\Http\Controllers;

use App\Http\Requests\PaymentLinkRequest;
use App\Mail\MayaPaymentMail;
use App\Models\Transaction;
use GlennRaya\Xendivel\Xendivel;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;

class MayaPaymentController extends Controller
{
    public function sendMayaPaymentLink(PaymentLinkRequest $request)
    {
        try {
            $transaction = $this->saveTransaction($request->toArray());

            $payment = Xendivel::payWithEwallet([
                'amount' => (int) $request->amount,
                'currency' => 'PHP',
                'checkout_method' => 'ONE_TIME_PAYMENT',
                'channel_code' => 'PH_GCASH',
                'channel_properties' => [
                    'success_redirect_url' => config('payment.success_redirect_url'),
                    'failure_redirect_url' => config('payment.failure_redirect_url'),
                    'cancel_redirect_url' => config('payment.cancel_redirect_url'),
                ],
                'metadata' => [
                    'id' => $transaction->id,
                ],
            ])->getResponse();

            // Mail::to($request->email)
            //     ->send(new MayaPaymentMail($payment));

            return $payment;
        } catch (\Exception $exception) {
            throw $exception;
        }
    }

    private function saveTransaction(array $payload)
    {
        try {
            return DB::transaction(function () use ($payload) {
                return Transaction::create([
                    'reference_id' => Str::uuid(),
                    'user_id' => auth()->id(),
                    'amount' => (int) $payload['amount'],
                    'payment_code' => 'PH_GCASH',
                    'channel_code' => 'GCASH',
                    'status' => 'PENDING',
                    'agent_name' => $payload['agent_name'],
                    'agent_phone' => $payload['agent_phone'],
                    'name' => $payload['name'],
                ]);
            });
        } catch (\Exception $exception) {
            throw $exception;
        }
    }
}
