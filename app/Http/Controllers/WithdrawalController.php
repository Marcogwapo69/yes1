<?php

namespace App\Http\Controllers;

use App\Http\Requests\WithdrawalRequest;
use GlennRaya\Xendivel\Xendivel;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;

class WithdrawalController extends Controller
{
    /**
     * Withdraw funds from Xendit account to bank account.
     */
    public function withdrawToBank(WithdrawalRequest $request)
    {
        // A very simple validation to check if the user who
        // performs the request is the main_account.
        if (Auth::user()->business->account_type !== 'main_account') {
            abort(403, 'You are not authorized to perform this action.');
        }

        try {
            // throw new \Exception("The server cannot handle the immense workload. Try to reboot the server or go home!", 500);
            $withdrawal = Xendivel::payoutLink()->sendPayoutLink([
                'idempotency-key' => Str::uuid()->toString(),
                'reference_id' => Str::uuid(),
                'channel_code' => $request->channel_code,
                'channel_properties' => [
                    'account_holder_name' => $request->name,
                    'account_number' => $request->account_number,
                ],
                'amount' => (int) $request->amount,
                'currency' => 'PHP',
                'description' => config('app.name').' Withdraw Funds',
                'metadata' => [
                    'type' => 'withdrawal',
                ],
            ]);

            if ($withdrawal['status'] === 'ACCEPTED') {
                return response()->json([
                    'status' => 'success',
                    'withdrawal' => $withdrawal->json(),
                ]);
            }
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'errors' => [
                    'message' => $e->getMessage(),
                ],
            ], 500);
        }
    }
}
