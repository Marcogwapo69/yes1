<?php

use App\Http\Controllers\XenPlatformController;
use Illuminate\Support\Facades\Route;

Route::post('/transfer', [XenPlatformController::class, 'transferFund']);

Route::delete('/delete-accounts', [XenPlatformController::class, 'deleteAccounts']);
