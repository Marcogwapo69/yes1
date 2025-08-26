<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Business extends Model
{
    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'account_type',
        'user_id',
        'business_id',
        'business_name',
    ];

    /**
     * Fetch the user who owns the business account.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
