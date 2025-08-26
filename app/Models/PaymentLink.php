<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PaymentLink extends Model
{
    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'user_id',
        'business_id',
        'name',
        'email',
        'agent_name',
        'agent_phone',
        'amount',
        'unique_code',
        'is_paid',
    ];
}
