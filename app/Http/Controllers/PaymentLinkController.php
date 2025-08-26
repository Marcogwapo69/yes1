<?php

namespace App\Http\Controllers;

use App\Http\Requests\CheckPaymentLinkRequest;
use App\Http\Requests\PaymentLinkRequest;
use App\Mail\PaymentLinkMail;
use App\Models\PaymentLink;
use App\Services\Transaction\PaymentLinkService;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;

class PaymentLinkController extends Controller
{
    protected $paymentLinkService;

    public function __construct(PaymentLinkService $paymentLinkService)
    {
        $this->paymentLinkService = $paymentLinkService;
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(PaymentLinkRequest $request)
    {
        DB::beginTransaction();
        try {
            $unique_code = Str::uuid();

            $request->merge([
                'user_id' => Auth::id(),
                'business_id' => Auth::user()->business->account_type !== 'main_account' ? Auth::user()->business->business_id : null,
                'unique_code' => $unique_code,
            ]);

            $payment_link = PaymentLink::create($request->all());

            DB::commit();

            Mail::to($request->email)
                ->send(new PaymentLinkMail($payment_link));

            return response()->json([
                'success' => 'true',
                'message' => 'Payment link created successfully',
            ]);
        } catch (\Exception $exception) {
            DB::rollBack();

            return response()->json([
                'success' => 'false',
                'message' => $exception->getMessage(),
            ]);
        }
    }

    public function checkLinkStatus(CheckPaymentLinkRequest $request)
    {
        return $this->paymentLinkService->updatePaymentLink($request);
    }
}
