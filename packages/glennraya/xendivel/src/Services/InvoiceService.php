<?php

namespace GlennRaya\Xendivel\Services;

use Exception;
use GlennRaya\Xendivel\XenditApi;
use Illuminate\Http\Client\Response;

class InvoiceService extends XenditApi
{
    /**
     * Create Invoice
     */
    public static function createInvoice(array $payload): Response
    {
        $response = XenditApi::api('post', '/v2/invoices', $payload);

        return self::response($response);
    }

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
}
