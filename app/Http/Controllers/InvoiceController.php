<?php

namespace App\Http\Controllers;

use App\Http\Requests\InvoicingRequest;
use App\Mail\InvoiceMail;
use App\Models\Transaction;
use GlennRaya\Xendivel\Xendivel;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;

class InvoiceController extends Controller
{
    /**
     * Create an invoice and send it to the customer's email.
     *
     * @param  \Illuminate\Http\Request  $request
     */
    public function createInvoice(InvoicingRequest $request): JsonResponse
    {
        DB::beginTransaction();

        try {
            $invoice = Xendivel::invoicing()->createInvoice([
                'external_id' => Str::uuid(),
                'amount' => (int) $request->amount,
                'payment_methods' => ['CREDIT_CARD'],
                'currency' => 'PHP',
                'metadata' => [
                    'user_id' => Auth::id(),
                ],
            ]);

            Transaction::create([
                'name' => $request->name." ({$request->email})",
                'reference_id' => $invoice['external_id'],
                'channel_code' => 'INVOICE',
                'payment_code' => 'INVOICE',
                'status' => 'ACTIVE',
                'user_id' => Auth::id(),
                'amount' => $request->amount,
            ]);

            DB::commit();

            Mail::to($request->email)
                ->send(new InvoiceMail($invoice['invoice_url']));

            return response()->json([
                'success' => true,
                'data' => json_decode($invoice),
            ]);
        } catch (\Exception $e) {
            DB::rollBack();

            // Decode the message if it's JSON, otherwise use the raw message
            $decoded_message = json_decode($e->getMessage(), true);

            // Fallback to raw message
            $message = $decoded_message['message'] ?? $e->getMessage();

            return response()->json([
                'success' => false,
                'errors' => [
                    'message' => $message,
                ],
                'message' => $message,
            ], 500);
        }
    }
}
