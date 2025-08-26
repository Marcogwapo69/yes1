<?php

namespace App\Http\Controllers;

use App\Enums\CardPaymentFailures;
use App\Http\Requests\GeneratePaymentCodeRequest;
use App\Mail\PaymentReceived;
use App\Models\PaymentLink;
use App\Models\Transaction;
use App\Models\User;
use App\Services\Transaction\PaymentCodeService;
use App\Services\Transaction\PaymentLinkCommissionService;
use App\Services\Transaction\PaymentLinkService;
use Carbon\Carbon;
use GlennRaya\Xendivel\Xendivel;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Illuminate\Testing\Exceptions\InvalidArgumentException;

class TransactionController extends Controller
{
    protected $payment_code_service;

    protected $paymentLinkService;

    protected $paymentLinkCommissionService;

    public function __construct(PaymentCodeService $payment_code_service, PaymentLinkService $paymentLinkService, PaymentLinkCommissionService $paymentLinkCommissionService)
    {
        $this->payment_code_service = $payment_code_service;
        $this->paymentLinkService = $paymentLinkService;
        $this->paymentLinkCommissionService = $paymentLinkCommissionService;
    }

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        // Check if the related business model's account_type is 'main_account'
        $userType = User::with('business')->where('id', $request->user_id)->first();

        $records = Transaction::where(function ($query) use ($userType) {
            if ($userType->business->account_type === 'main_account') {
                $query->where('user_id', Auth::id())
                    ->orWhereNull('user_id');
            } else {
                $query->where('user_id', $userType->id);
            }
        })
            ->orderBy(
                'created_at',
                'desc'
            )
            ->simplePaginate(10);

        // Add formatted date to each record
        /** @var \Illuminate\Pagination\Paginator $records */
        $records->getCollection()->transform(function ($payout) {
            $payout->formatted_created_at = Carbon::parse($payout->created_at)->format('D, M. j g:i a');

            if ($payout->status === 'ACTIVE') {
                $payout->formatted_updated_at = '-';
            } else {
                $payout->formatted_updated_at = Carbon::parse($payout->updated_at)->format('D, M. j g:i a');
            }

            return $payout;
        });

        $total_active = $this->getActiveCompletedAmount($userType, '', 'ACTIVE');
        $total_completed = $this->getActiveCompletedAmount($userType, '', 'COMPLETED');

        return [
            'records' => $records,
            'total_active' => number_format($total_active, 2),
            'total_completed' => number_format($total_completed, 2),
        ];
    }

    /**
     * Generate new payment code and save the transaction to the database.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return string - The generated payment code.
     */
    public function store(GeneratePaymentCodeRequest $request): string
    {
        $reference_id = Str::orderedUuid();

        $account_type = Auth::user()->business->account_type;
        $business_id = Auth::user()->business->business_id;

        // If the custom payment code setting is enabled,
        // You can start generating unique payment
        // code using the payment code string.
        $custom_payment_code = $this->payment_code_service->generateCustomPaymentCode($request);
        $payment = $this->payment_code_service->createPaymentCode([
            'for_user_id' => $account_type === 'sub_account' ? $business_id : null,
            'reference_id' => $reference_id,
            'channel_code' => $request->payment_option,
            'payment_code' => $custom_payment_code,
            'customer_name' => $request->name,
            'amount' => (int) $request->amount,
            'currency' => 'PHP',
            'market' => 'PH',
            'is_single_use' => $request->is_single_use,
        ]);

        DB::beginTransaction();
        try {
            $this->saveTransaction($request, $reference_id, $payment);

            DB::commit();
        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'error_code' => $e->getCode(),
                'message' => $e->getMessage(),
            ]);
        }

        return $payment;
    }

    /**
     * Save the transaction to the database.
     *
     * @param  \Illuminate\Http\Request  $request  - Request parameters
     * @param  string  $reference_id  - UUID for unique reference
     * @param  $payment  - Payment object returned by Xendit.
     */
    protected function saveTransaction($request, $reference_id, $payment): void
    {
        $transaction = new Transaction;
        $transaction->user_id = Auth::id();
        $transaction->reference_id = $reference_id;
        $transaction->channel_code = $request->payment_option;
        $transaction->agent_name = $request->agent_name;
        $transaction->agent_phone = $request->agent_phone;
        $transaction->send_notification = $request->send_notification;
        $transaction->sms_message = $request->sms_message;
        $transaction->name = $request->name;
        $transaction->amount = $request->amount;
        $transaction->commission = $request->commission ?? 0;
        $transaction->payment_code = $payment['payment_code'];
        $transaction->status = $payment['status'];
        $transaction->save();
    }

    /**
     * Accept payment via credit/debit cards
     *
     * @param  \Illuminate\Http\Request  $request  - Card details and name of the card holder.
     */
    public function payWithCard(Request $request)
    {
        $payment = Xendivel::payWithCard($request)
            ->getResponse();

        if ($payment->status === 'CAPTURED') {
            DB::beginTransaction();

            // Find the payment link via unique code to get the agent name.
            $agent = PaymentLink::select('user_id', 'business_id', 'agent_name', 'unique_code', 'agent_phone', 'amount')
                ->where('unique_code', $request->auth)
                ->first();

            try {
                $transaction = Transaction::create([
                    'user_id' => $agent->user_id,
                    'reference_id' => Str::orderedUuid(),
                    'payment_code' => $payment->masked_card_number,
                    'name' => $request->name,
                    'amount' => $request->amount,
                    'agent_name' => $agent->agent_name,
                    'status' => 'COMPLETED',
                ]);

                DB::commit();

                Mail::to(config('email_notification.email'))
                    ->send(new PaymentReceived($transaction));

                // Send commission to agent's Gcash Account.
                $this->paymentLinkCommissionService->sendCommission([
                    'amount' => $agent->amount,
                    'business_id' => $agent->business_id,
                    'agent_name' => $agent->agent_name,
                    'agent_phone' => $agent->agent_phone,
                ]);

                return response()->json([
                    'success' => true,
                    'message' => 'Your payment has been accepted.',
                ]);
            } catch (\Exception $exception) {
                DB::rollBack();

                return response()->json([
                    'success' => false,
                    'message' => $exception->getMessage(),
                ]);
            }
        }

        if ($payment->status === 'FAILED') {
            $failureReason = $payment->failure_reason;
            $failure = CardPaymentFailures::tryFrom($failureReason);

            if ($failure) {
                return response()->json([
                    'success' => false,
                    'message' => $failure->getMessage($payment->network_response->card_network_descriptor),
                ]);
            }

            return response()->json([
                'success' => false,
                'message' => 'An unknown error occurred.',
            ]);
        }
    }

    /**
     * Search database for matching search request.
     *
     * @param  string  $request  - Search request can either ber channel_code, payment_code, agent_name, or name.
     * @return array - Returns an array of records that match the search request.
     */
    public function search(Request $payload, $request)
    {
        $records = Transaction::select('channel_code', 'payment_code', 'agent_name', 'name', 'amount', 'status', 'created_at', 'updated_at')
            ->where('user_id', $payload->user_id)
            ->whereRaw('MATCH(channel_code, payment_code, agent_name, name) AGAINST (? IN BOOLEAN MODE)', ["+{$request}*"])
            ->orderBy('created_at', 'desc')
            ->simplePaginate(10);

        /** @var \Illuminate\Pagination\Paginator $records */
        // Transform the records to include formatted date, for those
        // that are active, the formatted_update_at will be a dash.
        $records->getCollection()->transform(function ($payout) {
            $payout->formatted_created_at = Carbon::parse($payout->created_at)->format('D, M. j g:i a');

            if ($payout->status === 'ACTIVE') {
                $payout->formatted_updated_at = '-';
            } else {
                $payout->formatted_updated_at = Carbon::parse($payout->updated_at)->format('D, M. j g:i a');
            }

            return $payout;
        });

        $userType = User::with('business')->where('id', $payload->user_id)->first();

        $total_active = $this->getActiveCompletedAmount($userType, $request, 'ACTIVE');

        $total_completed = $this->getActiveCompletedAmount($userType, $request, 'COMPLETED');

        return [
            'records' => $records,
            'total_active' => number_format($total_active, 2),
            'total_completed' => number_format($total_completed, 2),
        ];
    }

    /**
     * Filter records by selected date ranges.
     *
     * @param  \Illuminate\Http\Request  $request  - Selected date ranges to filter from.
     */
    public function filterByDate(Request $request)
    {
        // Check if the related business model's account_type is 'main_account'
        $userType = User::with('business')->where('id', $request->user_id)->first();

        $query_string = $request->query_string;

        $from = Carbon::parse($request->query('from'))
            ->setTimezone('Asia/Manila')
            ->startOfDay();

        $to = Carbon::parse($request->query('to'))
            ->setTimezone('Asia/Manila')
            ->endOfDay();

        $records = Transaction::where(function ($query) use ($userType) {
            if ($userType->business->account_type === 'main_account') {
                $query->where('user_id', Auth::id())
                    ->orWhereNull('user_id');
            } else {
                $query->where('user_id', $userType->id);
            }
        })
            ->when($from && $to, function ($query) use ($from, $to) {
                $query->whereBetween('created_at', [$from, $to])
                    ->whereBetween('updated_at', [$from, $to]);
            })
            ->when(! empty($query_string), function ($query) use ($from, $to, $query_string) {
                if (! is_string($query_string)) {
                    throw new InvalidArgumentException('Query string must be a string.');
                }

                $query->whereBetween('created_at', [$from, $to])
                    ->whereBetween('updated_at', [$from, $to])
                    ->where(function ($subQuery) use ($query_string) {
                        $subQuery->where('payment_code', $query_string)
                            ->orWhere('agent_name', 'like', '%'.$query_string.'%')
                            ->orWhere('name', 'like', '%'.$query_string.'%');
                    });
            })
            ->orderBy('created_at', 'desc')
            ->simplePaginate(10)
            ->appends([
                'from' => $request->query('from'),
                'to' => $request->query('to'),
            ]);

        // Add formatted date to each record
        /** @var \Illuminate\Pagination\Paginator $records */
        $records->getCollection()->transform(function ($payout) {
            $payout->formatted_created_at = Carbon::parse($payout->created_at)->format('D, M. j g:i a');

            if ($payout->status === 'ACTIVE') {
                $payout->formatted_updated_at = '-';
            } else {
                $payout->formatted_updated_at = Carbon::parse($payout->updated_at)->format('D, M. j g:i a');
            }

            return $payout;
        });

        // $total_active = $this->getActiveCompletedAmount($userType, $query_string ?? '', 'ACTIVE');
        // $total_completed = $this->getActiveCompletedAmount($userType, $query_string ?? '', 'COMPLETED');
        $total_active = $this->totalAmount('ACTIVE', $userType->id, $from, $to, $query_string);
        $total_completed = $this->totalAmount('COMPLETED', $userType->id, $from, $to, $query_string);

        return [
            'records' => $records,
            'total_active' => number_format($total_active, 2),
            'total_completed' => number_format($total_completed, 2),
        ];
    }

    /**
     * Retrieves the total payment amount for the given status ('ACTIVE' or 'COMPLETED'),
     * within the specified date range and using all required parameters.
     */
    private function totalAmount(string $status, int $userId, string $from, string $to, ?string $query_string = null)
    {
        return Transaction::where('status', $status)
            ->where(function ($query) use ($userId) {
                $query->where('user_id', $userId);
            })
            ->when($from && $to, function ($query) use ($from, $to) {
                $query->whereBetween('created_at', [$from, $to])
                    ->whereBetween('updated_at', [$from, $to]);
            })
            ->when(! empty($query_string), function ($query) use ($from, $to, $query_string) {
                if (! is_string($query_string)) {
                    throw new InvalidArgumentException('Query string must be a string.');
                }

                $query->whereBetween('created_at', [$from, $to])
                    ->whereBetween('updated_at', [$from, $to])
                    ->where(function ($subQuery) use ($query_string) {
                        $subQuery->where('payment_code', $query_string)
                            ->orWhere('agent_name', 'like', '%'.$query_string.'%')
                            ->orWhere('name', 'like', '%'.$query_string.'%');
                    });
            })
            ->sum('amount');
    }

    private function getActiveCompletedAmount(User $userType, string $request, string $status)
    {
        return Transaction::when($userType->business->account_type === 'main_account', function ($query) use ($request, $status, $userType) {
            $query->where(function ($sub_query) use ($request) {
                $sub_query
                    ->where('payment_code', $request)
                    ->orWhere('agent_name', 'like', "%{$request}%")
                    ->orWhere('name', 'like', "%{$request}%");
            })
                ->where('user_id', $userType->id)
                ->where('status', $status);

            // ->whereIn('status', $status)
        })
            ->when($userType->business->account_type === 'sub_account', function ($query) use ($userType, $request, $status) {
                $query->where('user_id', $userType->id)
                    ->where(function ($sub_query) use ($request) {
                        $sub_query->where('payment_code', $request)
                            ->orWhere('agent_name', 'like', "%{$request}%")
                            ->orWhere('name', 'like', "%{$request}%");
                    })
                    ->where('user_id', $userType->id)
                    ->where('status', $status);
            })
            ->sum('amount');
    }
}
