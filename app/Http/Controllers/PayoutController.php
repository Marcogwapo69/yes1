<?php

namespace App\Http\Controllers;

use App\Http\Requests\PayoutRequest;
use App\Models\Payout;
use Carbon\Carbon;
use GlennRaya\Xendivel\Xendivel;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class PayoutController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return Payout::with('user')
            ->when(Auth::user()->business->account_type === 'sub_account', function ($query) {
                // If the user is a sub_account, only show their payout requests.
                $query->where('user_id', Auth::id());
            })
            ->orderBy('status', 'desc')
            ->simplePaginate(10)
            ->through(function ($payout) {
                $payout->formatted_created_at = Carbon::parse($payout->created_at)->format('D, M. j g:i a');

                if ($payout->paid_at !== null) {
                    $payout->formatted_paid_at = Carbon::parse($payout->paid_at)->format('D, M. j g:i a');
                } else {
                    $payout->formatted_paid_at = '-';
                }

                $payout->amount = number_format($payout->amount, 2);

                return $payout;
            });
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \App\Http\Requests\PayoutRequest  $request  - The payout request object.
     */
    public function store(PayoutRequest $request)
    {
        DB::beginTransaction();
        try {
            do {
                $random_string = Str::random(12);
            } while (Payout::where('reference_id', $random_string)->exists());

            $payout = Payout::create([
                'user_id' => Auth::id(),
                'reference_id' => Str::upper($random_string),
                'channel_code' => $request->channel_code,
                'account_number' => $request->account_number,
                'account_holder_name' => $request->account_holder_name,
                'amount' => $request->amount,
                'status' => 'PENDING',
            ]);

            DB::commit();

            return $payout;
        } catch (\Exception $exception) {
            DB::rollBack();

            return response()->json([
                'status' => 'error',
                'message' => $exception->getMessage(),
            ], 500);
        }
    }

    /**
     * Approve payout requests.
     */
    public function approvePayout(Request $request): JsonResponse
    {
        DB::beginTransaction();
        try {
            $payout = Payout::find($request->id);

            $send_payout = Xendivel::payoutLink()->sendPayoutLink([
                'idempotency-key' => Str::uuid()->toString(),
                'for_user_id' => $payout->user->business->business_id,
                'reference_id' => $payout->reference_id,
                'email' => $payout->user->email,
                'channel_code' => $payout->channel_code,
                'channel_properties' => [
                    'account_holder_name' => $payout->account_holder_name,
                    'account_number' => $payout->account_number,
                ],
                'amount' => $payout->amount,
                'currency' => 'PHP',
                'description' => 'MMMDA Motor Trading Payout',
                'metadata' => [
                    'type' => 'payout',
                ],
            ]);

            if ($send_payout['status'] === 'ACCEPTED') {
                DB::commit();

                $payout->is_approved = 1;
                $payout->save();

                return response()->json([
                    'status' => 'success',
                    'payout' => $send_payout->json(),
                ]);
            }
        } catch (\Exception $exception) {
            DB::rollBack();

            return response()->json([
                'status' => 'error',
                'message' => $exception->getMessage(),
            ], 500);
        }
    }

    /**
     * Deny payout requests.
     *
     * @param  \Illuminate\Http\Request  $request  - The payout request id.
     */
    public function denyPayout(Request $request): JsonResponse
    {
        DB::beginTransaction();
        try {
            $payout = Payout::destroy($request->id);

            if ($payout > 0) {
                DB::commit();
            }
        } catch (\Exception $exception) {
            DB::rollBack();

            return response()->json([
                'status' => 'error',
                'message' => $exception->getMessage(),
            ], 500);
        } finally {
            return response()->json([
                'status' => 'success',
                'message' => 'Payout request denied.',
            ]);
        }
    }

    /**
     * Search for payout request.
     * It can accept the reference_id, channel_code,
     * account_number, account_holder_name, and amount.
     *
     * @param  \Illuminate\Http\Request  $request  - The search keyword.
     */
    public function search(Request $request): array
    {
        $payouts = Payout::select('reference_id', 'channel_code', 'account_number', 'account_holder_name', 'amount', 'status', 'created_at')
            ->whereRaw('MATCH(channel_code, account_number, account_holder_name) AGAINST (? IN NATURAL LANGUAGE MODE)', [$request])
            ->simplePaginate(10);

        return [
            'data' => $payouts,
        ];
    }
}
