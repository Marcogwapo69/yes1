<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserCanSendInvoice
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (config('payment.invoice_api') === false) {
            return response()->json([
                'success' => false,
                'errors' => [
                    'message' => 'Invoicing is not enabled for this account.',
                ],
                'message' => 'Invoicing is not enabled for this account.',
            ], 403);
        }

        return $next($request);
    }
}
