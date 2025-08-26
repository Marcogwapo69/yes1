<?php

namespace GlennRaya\Xendivel\Services;

use GlennRaya\Xendivel\XenditApi;

class PayoutService extends XenditApi
{
    /**
     * Send payout to the specified payment destination.
     *
     * @param  array  $payload  Data required to create the payment code
     */
    public static function sendPayoutLink(array $payload)
    {
        $response = XenditApi::api('post', '/v2/payouts', $payload);

        // Thrown an exception on failure.
        if ($response->failed()) {
            throw new \Exception($response);
        }

        // Return the instance of the Xendivel class to enable method chaining.
        return $response;
    }
}
