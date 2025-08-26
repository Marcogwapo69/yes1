<?php

use App\Http\Controllers\WithdrawalController;
use Illuminate\Support\Facades\Route;

Route::post('/withdraw', [WithdrawalController::class, 'withdrawToBank']);
