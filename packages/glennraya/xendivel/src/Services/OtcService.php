<?php

namespace GlennRaya\Xendivel\Services;

use Exception;
use GlennRaya\Xendivel\XenditApi;
use Illuminate\Http\Client\Response;

class OtcService extends XenditApi
{
    /**
     * Create Over-the-counter payment code.
     *
     * For more details, see the Xendit API documentation:
     * https://developers.xendit.co/api-reference/#create-payment-code
     *
     * @param  array  $payload  Data required to create the payment code
     */
    public static function createPaymentCode(array $payload): Response
    {
        $response = XenditApi::api('post', '/payment_codes', $payload);

        // Thrown an exception on failure.
        if ($response->failed()) {
            throw new Exception($response);
        }

        // Return the instance of the Xendivel class to enable method chaining.
        return $response;
    }

    /**
     * Get payment code information.
     */
    public static function getPaymentCode(string $payment_code_id): Response
    {
        $response = XenditApi::api('get', "/payment_codes/{$payment_code_id}", []);

        // Thrown an exception on failure.
        if ($response->failed()) {
            throw new Exception($response);
        }

        // Return the instance of the Xendivel class to enable method chaining.
        return $response;
    }

    /**
     * Simulate over-the-counter payment.
     */
    public static function simulateOtcPayment(array $payload)
    {
        $response = XenditApi::api('post', '/payment_codes/simulate_payment', $payload);

        // Thrown an exception on failure.
        if ($response->failed()) {
            throw new Exception($response);
        }

        // Return the instance of the Xendivel class to enable method chaining.
        return $response;
    }
}
