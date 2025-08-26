<?php

namespace GlennRaya\Xendivel\Services;

use Exception;
use GlennRaya\Xendivel\XenditApi;
use Illuminate\Http\Client\Response;

class XenPlatformService extends XenditApi
{
    /**
     * Return the response of Xendit API request.
     */
    private static function response($response): Response
    {
        // Thrown an exception on failure.
        if ($response->failed()) {
            throw new Exception($response);
        }

        // Return the instance of the Xendivel class to enable method chaining.
        return $response;
    }

    /**
     * List all Xendit business accounts or sub-accounts.
     */
    public static function listAccounts(): Response
    {
        $response = XenditApi::api('get', '/v2/accounts', []);

        return self::response($response);
    }

    /**
     * Create split rule.
     */
    public static function createSplitRule(array $payload = []): Response
    {
        $response = XenditApi::api('post', '/split_rules', $payload);

        return self::response($response);
    }

    /**
     * Transfer fund from main account to sub-account or vice-versa.
     *
     * @param  array  $payload  - The required data to successfully transfer funds.
     */
    public static function transferFund(array $payload = []): Response
    {
        $response = XenditApi::api('post', '/transfers', $payload);

        return self::response($response);
    }
}
