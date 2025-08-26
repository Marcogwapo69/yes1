<?php

use App\Http\Controllers\CommissionController;
use Illuminate\Support\Facades\Route;

Route::resource('commissions', CommissionController::class)
    ->middleware(['auth']);
