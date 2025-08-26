<?php

use App\Http\Controllers\MayaPaymentController;
use Illuminate\Support\Facades\Route;

Route::group(['middleware' => 'auth'], function () {
    Route::post('send-maya-payment-link', [MayaPaymentController::class, 'sendMayaPaymentLink']);
});
