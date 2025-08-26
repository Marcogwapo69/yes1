<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Auth;

/**
 * @property string $agent_name
 * @property string $name
 * @property string $amount
 */
class Transaction extends Model
{
    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'reference_id',
        'qr_id',
        'user_id',
        'channel_code',
        'payment_code',
        'agent_name',
        'agent_phone',
        'send_notification',
        'sms_message',
        'name',
        'amount',
        'qr_string',
        'commission',
        'status',
    ];

    protected $casts = [
        'created_at' => 'datetime:D, F j, Y',
    ];

    /**
     * Capitalize each word in a name.
     */
    protected function name(): Attribute
    {
        return Attribute::make(
            set: fn ($value) => ucwords(strtolower($value))
        );
    }

    /**
     * Capitalize each word of the agent name.
     */
    protected function agentName(): Attribute
    {
        return Attribute::make(
            set: fn ($value) => ucwords(strtolower($value))
        );
    }

    /**
     * Filter the user_id or if user_id is null
     *
     * @param  object  $query
     * @return void
     */
    public function scopeFilterUserOrNull($query)
    {
        $is_main_account = Auth::user()?->business?->account_type === 'main_account';

        $query->where(function ($sub_query) use ($is_main_account) {
            $sub_query->where('user_id', Auth::id());

            // Add additional constraints if the user is the main_account
            if ($is_main_account) {
                $sub_query->orWhereNull('user_id');
            }
        });
    }

    /**
     * Filter the search keyword.
     */
    public function scopeFilterSearch($query, $request)
    {
        $query->where(function ($sub_query) use ($request) {
            $sub_query->where('payment_code', $request)
                ->orWhere('agent_name', 'like', "%{$request}%")
                ->orWhere('name', 'like', "%{$request}%");
        });
    }
}
