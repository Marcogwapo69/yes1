<?php

namespace GlennRaya\Xendivel\Services;

use Exception;
use GlennRaya\Xendivel\XenditApi;
use Illuminate\Http\Client\Response;

class BalanceService extends XenditApi
{
    /**
     * Get the total balance of a Xendit account.
     *
     * This is the available balance that can
     * be withdrawn or transfer to other accounts.
     */
    public static function getBalance(string $account_type, array $payload): Response
    {
        $response = XenditApi::api('get', "/balance?account_type={$account_type}", $payload);

        // Thrown an exception on failure.
        if ($response->failed()) {
            throw new Exception($response);
        }

        // Return the instance of the Xendivel class to enable method chaining.
        return $response;
    }
}
