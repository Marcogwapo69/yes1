<?php

use App\Http\Controllers\InvoiceController;
use App\Http\Middleware\EnsureUserCanSendInvoice;
use Illuminate\Support\Facades\Route;

Route::post('/send-invoice', [InvoiceController::class, 'createInvoice'])
    ->middleware(EnsureUserCanSendInvoice::class);
