<?php

use App\Http\Controllers\PaymentLinkController;
use App\Http\Controllers\TransactionController;
use App\Http\Middleware\EnsureCardPaymentIsEnabled;
use App\Http\Middleware\EnsurePaymentLinkIsEnabled;
use App\Models\PaymentLink;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/pay', function (Request $request) {
    return Inertia::render('CardsPayment', [
        'auth' => $request->query('auth'),
    ]);
})->middleware(EnsureCardPaymentIsEnabled::class);

Route::get('/fetch-payment-amount', function (Request $request) {
    return PaymentLink::select('amount', 'unique_code')
        ->where('unique_code', $request->unique_code)->first();
})->middleware(EnsureCardPaymentIsEnabled::class);

Route::post('/pay-with-card', [TransactionController::class, 'payWithCard'])
    ->middleware(EnsureCardPaymentIsEnabled::class);

Route::post('/check-payment-link', [PaymentLinkController::class, 'checkLinkStatus'])
    ->middleware(EnsurePaymentLinkIsEnabled::class);

Route::get('/commission-sent', function () {
    return Inertia::render('Success');
});

Route::get('/commission-failed', function () {
    return Inertia::render('Failed');
});

Route::post('/create-payment-link', [PaymentLinkController::class, 'store'])
    ->middleware(EnsurePaymentLinkIsEnabled::class);
