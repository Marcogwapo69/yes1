<?php

namespace App\Http\Controllers;

use App\Http\Middleware\VerifyAccountType;
use App\Http\Requests\AddSubAccountRequest;
use App\Models\Business;
use App\Models\User;
use GlennRaya\Xendivel\Xendivel;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;

class BusinessController extends Controller implements HasMiddleware
{
    /**
     * Get the middleware that should be assigned to the controller.
     */
    public static function middleware(): array
    {
        return [
            new Middleware(VerifyAccountType::class, only: ['index']),
        ];
    }

    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $user = Auth::user();

        $businesses = [];
        $accounts = Business::with('user')->where('account_type', 'sub_account')->get();

        foreach ($accounts as $account) {
            $balance = Xendivel::balance()->getBalance('CASH', ['for_user_id' => $account->business_id]);

            $businesses[] = [
                'id' => $account->id,
                'business_id' => $account->business_id,
                'business_name' => $account->business_name,
                'user' => $account->user,
                // 'balance' => 'PHP ' . number_format($balance['balance'], 2),
                'balance' => $balance['balance'],
            ];
        }

        // Get balance of the main account
        $balance = Xendivel::balance()->getBalance('CASH', []);

        return Inertia::render('BusinessAccounts/Index', [
            'balance' => $user->business->account_type === 'main_account' ? number_format($balance['balance'], 2) : '',
            'accounts' => $businesses,
        ]);
    }

    public function show(Business $business)
    {
        $business->load('user'); // Load the user without transactions here

        $transactions = $business->user->transactions()
            ->latest()
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('BusinessAccounts/Show', [
            'business' => $business,
            'transactions' => $transactions,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(AddSubAccountRequest $request)
    {
        DB::beginTransaction();
        try {
            $new_user = new User;
            $new_user->name = $request->agent_name;
            $new_user->email = $request->email;
            $new_user->password = Hash::make($request->password);
            $new_user->save();

            $new_sub_account = new Business;
            $new_sub_account->business_id = $request->business_id;
            $new_sub_account->account_type = 'sub_account';
            $new_sub_account->user_id = $new_user->id;
            $new_sub_account->business_name = $request->business_name;
            $new_sub_account->save();

            DB::commit();
        } catch (\Exception $e) {
            return $e->getMessage();
            DB::rollBack();
        }

        return response()->json([
            'status' => 'success',
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Business $business)
    {
        //
    }
}
