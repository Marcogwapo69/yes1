<?php

namespace App\Services\Transaction;

use App\Http\Requests\CheckPaymentLinkRequest;
use App\Models\PaymentLink;

class PaymentLinkService
{
    public function updatePaymentLink(CheckPaymentLinkRequest $request)
    {
        if ($request->auth !== '') {
            try {
                $status = PaymentLink::select('unique_code', 'is_paid', 'amount')
                    ->where('unique_code', $request->auth)->first();

                if (! $status) {
                    return response()->json([
                        'success' => false,
                        'message' => 'This payment link signature is not found.',
                    ], 404);
                }

                if ($status->is_paid === 0) {
                    $payment_link = PaymentLink::where('unique_code', $request->auth)
                        ->first();

                    if ($payment_link->amount !== (int) $request->amount) {
                        return response()->json([
                            'success' => false,
                            'message' => 'You provided an amount that is different from the invoice you received from the email. Please check the amount and try again.',
                        ], 500);
                    }

                    $payment_link->is_paid = true;
                    $payment_link->save();

                    return response()->json([
                        'success' => true,
                        'message' => 'Payment link updated successfully.',
                    ]);
                }

                return response()->json([
                    'success' => false,
                    'message' => 'This payment link has already been used.',
                ]);
            } catch (\Exception $exception) {
                return response()->json([
                    'success' => false,
                    'message' => $exception->getMessage(),
                ], 500);
            }
        }
    }
}
