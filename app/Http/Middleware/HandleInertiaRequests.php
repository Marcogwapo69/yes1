<?php

namespace App\Http\Middleware;

use App\Models\Business;
use GlennRaya\Xendivel\Xendivel;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $account = Business::where('user_id', Auth::id())
            ->select('account_type', 'user_id', 'business_id')
            ->first();

        $balance = '';
        if ($account) {
            $balance = Xendivel::balance()->getBalance('CASH', [
                'for_user_id' => $account->account_type === 'sub_account' ? $account->business_id : '',
            ]);
        }

        return [
            ...parent::share($request),
            'auth' => [
                'user' => optional($request->user())->load('business'),
            ],
            'app_name' => config('app.name'),
            'payouts' => config('app.settings.payouts') ? true : false,
            'invoicing' => config('payment.invoice_api') ? true : false,
            'payment_link' => config('payment.payment_link') ? true : false,
            'can_send_sms_notification' => config('payment.can_send_sms_notification') ? true : false,
            'payment_code_commission' => config('payment.payment_code_commission') ? true : false,
            'balance' => $account ? number_format($balance['balance'], 2) : '',
        ];
    }
}