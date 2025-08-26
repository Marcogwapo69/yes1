<?php

namespace App\Services\Transaction;

use App\Contracts\CommissionInterface;
use App\Models\Commission;
use GlennRaya\Xendivel\Xendivel;
use Illuminate\Support\Str;

class PaymentCodeCommissionService implements CommissionInterface
{
    /**
     * Send commission to the agent who pays via payment code.
     *
     * @param  array  $data  - Payload for the commission.
     */
    public function sendCommission(array $data)
    {
        // Calculate commission amount
        // $multiplier = Commission::first();
        // $total_commission = ($multiplier->percentage / 100) * $data['amount'];

        $commission = Xendivel::payoutLink()->sendPayoutLink([
            'idempotency-key' => Str::uuid()->toString(),
            'for_user_id' => $data['business_id'],
            'reference_id' => Str::uuid(),
            'amount' => (int) $data['amount'],
            'channel_code' => 'PH_GCASH',
            'currency' => 'PHP',
            'channel_properties' => [
                'account_holder_name' => Str::ucfirst($data['agent_name']),
                'account_number' => $data['agent_phone'],
            ],
            'description' => config('app.name').' Commission',
            'metadata' => [
                'type' => 'commission',
                'agent_name' => Str::ucfirst($data['agent_name']),
                'agent_phone' => $data['agent_phone'],
            ],
        ]);

        return $commission;
    }
}
