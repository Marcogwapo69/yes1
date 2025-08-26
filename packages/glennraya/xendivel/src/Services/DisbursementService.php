<?php

namespace GlennRaya\Xendivel\Services;

use Exception;
use GlennRaya\Xendivel\XenditApi;
use Illuminate\Http\Client\Response;

class DisbursementService extends XenditApi
{
    /**
     * Transfer funds from Xendit account to bank account.
     */
    public function transferToBank(array $payload): Response
    {
        $response = XenditApi::api('get', '/disbursements', $payload);

        // Thrown an exception on failure.
        if ($response->failed()) {
            throw new Exception($response);
        }

        // Return the instance of the Xendivel class to enable method chaining.
        return $response;
    }
}
