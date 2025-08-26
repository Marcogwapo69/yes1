<?php

use App\Actions\Webhook\SendSmsNotificationAction;
use App\Mail\CommissionMail;
use App\Mail\PaymentReceived;
use App\Mail\PayoutMail;
use App\Mail\WithdrawalMail;
use App\Models\Payout;
use App\Models\Transaction;
use App\Models\User;
use App\Services\Transaction\PaymentCodeCommissionService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Route;

/**
 * Update the status of a payout.
 */
if (! function_exists('updatePayoutStatus')) {
    function updatePayoutStatus(?string $referenceId, string $status): void
    {
        if ($referenceId) {
            Payout::where('reference_id', $referenceId)->update([
                'status' => $status,
                'paid_at' => $status === 'PAID' ? now() : null,
            ]);
        }
    }
}

/**
 * Send a withdrawal notification email.
 */
if (! function_exists('sendWithdrawalEmail')) {
    function sendWithdrawalEmail(array $data): void
    {
        Mail::to(config('email_notification.email'))->send(new WithdrawalMail($data));
    }
}

/**
 * Send a payout notification email.
 */
if (! function_exists('sendPayoutNotification')) {
    function sendPayoutNotification(array $data): void
    {
        Mail::to(config('email_notification.email'))->send(new PayoutMail($data));
    }
}

/**
 * Send commission notification
 */
if (! function_exists('sendCommissionNotification')) {
    function sendCommissionNotification(array $commission): void
    {
        Mail::to(config('email_notification.email'))
            ->send(new CommissionMail($commission));
    }
}

// Webhook for OTC payments.
Route::post(config('xendivel.webhook_url'), function (Request $request, SendSmsNotificationAction $sendSms) {
    Transaction::where('reference_id', $request['reference_id'])
        ->update(['status' => $request['status']]);

    $transaction = Transaction::where('reference_id', $request['reference_id'])->first();

    // Fetch the user who generates the payment code.
    $user = User::select('id')
        ->with('business')
        ->where('id', $transaction->user_id)
        ->first();

    // Send commission to agent's Gcash Account.
    // NOTE: Only user with 'main_account' type will be able to send commission.
    if (config('payment.payment_code_commission') && $user->business->account_type === 'main_account') {
        $commission = new PaymentCodeCommissionService;

        if ($transaction->commission > 0) {
            $commission->sendCommission([
                // 'amount' => (int) $transaction->amount,
                'amount' => (int) $transaction->commission,
                'business_id' => $user->business->account_type === 'sub_account' ? $user->business->business_id : null,
                'agent_name' => $transaction->agent_name,
                'agent_phone' => $transaction->agent_phone,
            ]);
        }
    }

    // Send email notification to agents.
    Mail::to(config('email_notification.email'))
        ->send(new PaymentReceived($transaction));

    // Send SMS notification to agents.
    if ($transaction->send_notification === 1) {
        $sendSms->handle($transaction);
    }
});

// Webhook for payouts and withdrawals.
Route::post(config('xendivel.webhook_url') . '/payouts', function (Request $request) {
    $type = $request->data['metadata']['type'] ?? null;
    $referenceId = $request->data['reference_id'] ?? null;

    if ($request->event === 'payout.succeeded') {
        match ($type) {
            'withdrawal' => sendWithdrawalEmail($request->toArray()),
            'commission' => sendCommissionNotification($request->toArray()),
            'payout' => sendPayoutNotification($request->toArray())
        };

        // Update payout status to PAID
        if ($type === 'payout') {
            updatePayoutStatus($referenceId, 'PAID');
        }
    } else {
        match ($type) {
            'withdrawal' => sendWithdrawalEmail($request->toArray()),
            'commission' => sendCommissionNotification($request->toArray()),
        };

        // Update payout status to FAILED
        if ($type === 'approvePayout') {
            updatePayoutStatus($referenceId, 'FAILED');
        }
    }
});

// Webhook for invoices
Route::post(config('xendivel.webhook_url') . '/invoices', function (Request $request) {
    if ($request->status === 'PAID') {
        DB::beginTransaction();
        try {
            Transaction::where('reference_id', $request->external_id)
                ->update([
                    'status' => 'COMPLETED',
                ]);

            DB::commit();

            return response()->json([
                'success' => true,
            ], 200);
        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'success' => false,
                'data' => $e->getMessage(),
            ], 500);
        }
    }
});

Route::post(config('xendivel.webhook_url') . '/ewallet', function (Request $request) {
    // logger($request->data['metadata']['branch_code']);

    if ($request->data['status'] === 'SUCCEEDED') {
        try {
            DB::transaction(function () use ($request) {
                Transaction::where('id', $request->data['metadata']['id'])
                    ->update([
                        'status' => 'COMPLETED',
                    ]);
            });
        } catch (\Exception $exception) {
            throw $exception;
        }
    }
});

Route::post(config('xendivel.webhook_url') . '/qr', function (Request $request) {
    if ($request->data['status'] === 'SUCCEEDED') {
        try {
            DB::transaction(function () use ($request) {
                Transaction::where('qr_id', $request->data['qr_id'])
                    ->update([
                        'status' => 'COMPLETED',
                    ]);
            });
        } catch (\Exception $exception) {
            throw $exception;
        }
    }
});
