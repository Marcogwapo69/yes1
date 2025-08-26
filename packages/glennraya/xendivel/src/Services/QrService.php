<?php

namespace GlennRaya\Xendivel\Services;

use Exception;
use GlennRaya\Xendivel\XenditApi;
use Illuminate\Http\Client\Response;

class QrService extends XenditApi
{
    /**
     * Create QR code for payment.
     *
     * For more details, see the Xendit API documentation:
     * https://developers.xendit.co/api-reference/#create-qr-code
     *
     * @param  array  $payload  Data required to create the QR code.
     */
    public static function createQrCode(array $payload): Response
    {
        $response = XenditApi::api('post', '/qr_codes', $payload);

        // Thrown an exception on failure.
        if ($response->failed()) {
            throw new Exception($response);
        }

        // Return the instance of the Xendivel class to enable method chaining.
        return $response;
    }
}
