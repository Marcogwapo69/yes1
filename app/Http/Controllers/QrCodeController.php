<?php

namespace App\Http\Controllers;

use App\Http\Requests\QrRequest;
use App\Models\Transaction;
use chillerlan\QRCode\QRCode;
use GlennRaya\Xendivel\Xendivel;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class QrCodeController extends Controller
{
    /**
     * Create a QR code for payment.
     *
     * @param  App\Http\Requests\QrRequest $request
     * @return Illuminate\Http\JsonResponse
     */
    public function createQrCode(QrRequest $request): JsonResponse
    {
        try {
            $qrCode = Xendivel::qrCode()->createQrCode([
                'reference_id' => Str::uuid(),
                'currency' => 'PHP',
                'type' => 'DYNAMIC',
                'amount' => (int) $request->amount,
            ]);

            $transaction = DB::transaction(function () use ($request, $qrCode) {
                return Transaction::create([
                    'reference_id' => Str::uuid(),
                    'qr_id' => $qrCode['id'],
                    'user_id' => auth()->id(),
                    'amount' => (int) $request->amount,
                    'qr_string' => $qrCode['qr_string'],
                    'channel_code' => 'QR_CODE',
                    'payment_code' => 'QR_CODE',
                    'status' => 'PENDING',
                    'agent_name' => $request->agent_name,
                    'agent_phone' => $request->agent_phone,
                    'name' => $request->name,
                ]);
            });

            return response()->json([
                'success' => true,
                'amount' => $transaction->amount,
                'qrCode' => (new QRCode)->render($qrCode['qr_string']),
            ]);
        } catch (\Exception $exception) {
            throw $exception;
        }
    }
}
