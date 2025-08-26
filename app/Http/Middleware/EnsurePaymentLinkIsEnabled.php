<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsurePaymentLinkIsEnabled
{
    /**
     * Check if the payment link feature is enabled. If not, return an error 403.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (config('payment.payment_link') === false) {
            return response()->json([
                'success' => false,
                'errors' => [
                    'message' => "You don't have permission to access this resource.",
                ],
                'message' => "You don't have permission to access this resource.",
            ], 403);
        }

        return $next($request);
    }
}
