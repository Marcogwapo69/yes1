<?php

namespace App\Http\Controllers;

use App\Models\Business;
use GlennRaya\Xendivel\Xendivel;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class XenPlatformController extends Controller
{
    /**
     * Transfer fund from Xendit main account to sub account or vice-versa.
     *
     * @param \Illuminate\Http\Request - The business ID and the amount to be transferred.
     * @return \Illuminate\Http\Client\Response
     */
    public function transferFund(Request $request): JsonResponse
    {
        try {
            // Prepare transfer data
            $transferData = [
                'reference' => Str::uuid(),
                'amount' => (int) $request->input('amount'),
                'source_user_id' => $request->input('business_id'), // Sub account ID
                'destination_user_id' => Auth::user()->business->business_id, // Main account ID
            ];

            // Perform the transfer
            $transfer = Xendivel::xenPlatform()->transferFund($transferData);

            return response()->json([
                'success' => true,
                'message' => 'Fund transfer successful.',
                'data' => $transfer,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Fund transfer failed. Please try again.',
            ], 500);
        }
    }

    /**
     * Delete all selected accounts that have 0 balance on their account.
     *
     * @param \Illuminate\Http\Request - The business IDs of the account to be deleted.
     * @return \Illuminate\Http\Client\JsonResponse
     */
    public function deleteAccounts(Request $request): JsonResponse
    {
        $businesses = $request->business_ids;

        // Array to store business IDs with 0 balance
        $businesses_with_zero_balance = [];

        try {
            // Check the balance of a business account, if the
            // balance is 0, this account can be deleted.
            foreach ($businesses as $business) {
                $balance = Xendivel::balance()->getBalance('CASH', ['for_user_id' => $business]);

                // Check if balance is 0
                if ($balance['balance'] === 0) {
                    // Add to the array
                    $businesses_with_zero_balance[] = $business;
                }
            }

            // Delete businesses with zero balance
            if (! empty($businesses_with_zero_balance)) {
                // Bulk delete by IDs
                DB::transaction(function () use ($businesses_with_zero_balance) {
                    // Get all businesses (plus their user) to be deleted
                    $businesses = Business::whereIn('business_id', $businesses_with_zero_balance)
                        ->with('user')
                        ->get();

                    foreach ($businesses as $business) {
                        // Delete the user
                        if ($business->user) {
                            $business->user->delete();
                        }

                        // Delete the business
                        $business->delete();
                    }
                });
            }

            return response()->json([
                'success' => true,
                'message' => 'The sub-accounts was successfully deleted.',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Sub-account deletion failed. Please try again later.',
            ], 500);
        }
    }
}
