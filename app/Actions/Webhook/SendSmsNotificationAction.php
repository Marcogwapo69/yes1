<?php

namespace App\Actions\Webhook;

use Illuminate\Support\Facades\Http;

class SendSmsNotificationAction
{
    /**
     * Handle the logic for sending SMS notification to agents.
     */
    public function handle($transaction): void
    {
        $amount = number_format($transaction->amount, 2);

        $message = $transaction->sms_message !== null ? $transaction->sms_message : "Hi $transaction->agent_name, we are please to inform you that $transaction->name paid your invoice amounting to PHP$amount.";

        try {
            Http::post('https://api.semaphore.co/api/v4/messages', [
                'apikey' => config('payment.semaphore_api_key'),
                'number' => $transaction->agent_phone,
                'message' => $message,
                'sendername' => config('payment.sms_sender_name'),
            ]);
        } catch (\Exception $exception) {
            throw $exception;
        }
    }
}
