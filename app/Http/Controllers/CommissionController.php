<?php

namespace App\Http\Controllers;

use App\Models\Commission;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class CommissionController extends Controller
{
    /**
     * Show the commission edit page.
     *
     * @param  Request  $request
     */
    public function edit()
    {
        $commission = Commission::select('id', 'percentage')->first();

        return Inertia::render('Commission/Edit', ['commission' => $commission]);
    }

    public function update(Commission $commission, Request $request)
    {
        DB::beginTransaction();

        try {
            Commission::where('id', $commission->id)
                ->update(['percentage' => $request->rate]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'The commission rate was updated.',
            ]);
        } catch (\Exception $exception) {
            DB::rollBack();

            return response()->json([
                'success' => false,
                'errors' => [
                    'message' => $exception->getMessage(),
                ],
                'message' => $exception->getMessage(),
            ], 500);
        }
    }
}
