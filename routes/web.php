<?php

use App\Http\Controllers\BusinessController;
use App\Http\Controllers\PayoutController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\TransactionController;
use App\Http\Middleware\EnsureCanRequestPayouts;
use App\Mail\TestMail;
use GlennRaya\Xendivel\Xendivel;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Str;
use Inertia\Inertia;

Route::permanentRedirect('/', '/login');

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard/Index');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::get('/payouts-page', function () {
    return Inertia::render('Payouts/Index');
})
    ->middleware(['auth', 'verified'])
    ->middleware(EnsureCanRequestPayouts::class)
    ->name('payouts-page');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // Generate payment code.
    Route::post('/generate-payment-code', [TransactionController::class, 'store']);

    // Fetch all transactions.
    Route::get('/transactions', [TransactionController::class, 'index']);

    // Search recent records of transactions.
    Route::get('/search/{search}', [TransactionController::class, 'search']);

    Route::get('/filter-by-date', [TransactionController::class, 'filterByDate']);

    Route::get('/test', [TransactionController::class, 'filter']);
});

// For payment simulation only during development.
Route::post('/simulate-payment', function (Request $request) {
    return Xendivel::otc()->simulateOtcPayment([
        'reference_id' => Str::orderedUuid(),
        'payment_code' => $request->payment_code,
        'channel_code' => $request->channel_code,
        'amount' => (int) $request->amount,
        'currency' => 'PHP',
        'market' => 'PH',
        'for_user_id' => $request->for_user_id,
    ]);
});

// Test mailer function
Route::get('/mail-test', function () {
    Mail::to(config('email_notification.email'))
        ->send(new TestMail);
});

// Route::get('/sms', function (Request $request) {
//     $sendSms = Http::post('https://api.semaphore.co/api/v4/messages', [
//         'apikey' => config('payment.semaphore_api_key'),
//         'number' => '09762925564',
//         'message' => 'Your invoice #: 44627 has been paid.',
//         'sendername' => config('payment.sms_sender_name')
//     ]);

//     return $sendSms;
// });

// Approve the payout request.
Route::post('/approve-payout', [PayoutController::class, 'approvePayout'])
    ->middleware(['auth', 'verified']);

Route::post('/deny-payout', [PayoutController::class, 'denypayout'])
    ->middleware(['auth', 'verified']);

Route::resource('businesses', BusinessController::class)
    ->middleware(['auth', 'verified']);

Route::resource('payouts', PayoutController::class)
    ->middleware(['auth', 'verified']);

require __DIR__.'/auth.php';
require __DIR__.'/xenplatform.php';
require __DIR__.'/withdrawal.php';
require __DIR__.'/invoice.php';
require __DIR__.'/payment_link.php';
require __DIR__.'/maya_payment.php';
require __DIR__.'/qr.php';
require __DIR__.'/commission.php';
require __DIR__.'/webhooks.php';
