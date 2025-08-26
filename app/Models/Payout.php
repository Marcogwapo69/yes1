<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Payout extends Model
{
    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'user_id',
        'reference_id',
        'account_number',
        'account_holder_name',
        'channel_code',
        'amount',
        'status',
        'is_approved',
        'paid_at',
    ];

    /**
     * Get the user associated with the payout.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
