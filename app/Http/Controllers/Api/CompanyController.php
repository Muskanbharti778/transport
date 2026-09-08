<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Cache;

class CompanyController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //
    }

public function sendOtp(Request $request)
{
    $request->validate([
        'mobile' => [
            'required',
            'digits:10',
        ],
    ]);

    $mobile = $request->mobile;

    $otpurl = "https://demo.mandipro.com/wmain/whatsapp/send-authentication.php";
    $apikey = "z7zcrDGVhfFsNhagxjbDYhec6JPjIJWfw5DeorrhNuy=";

    // Generate 6 digit OTP
    $otp = random_int(100000, 999999);

    // OTP valid for 5 minutes
    $expiresAt = now()->addMinutes(5);

    // Indian mobile number
    $smsMobile = '91' . $mobile;

    // Store OTP
    DB::table('get_otp')->updateOrInsert(
        [
            'mobile' => $mobile,
        ],
        [
            'otpno' => $otp,
            'expires_at' => $expiresAt,
            'updated_at' => now(),
        ]
    );

    $data = [
        'templatename' => 'login_otp',
        'mobile' => $smsMobile,
        'otp' => (string) $otp,
    ];

    try {

        $response = Http::timeout(15)
            ->withHeaders([
                'Content-Type' => 'application/json',
                'X-API-KEY' => $apikey,
            ])
            ->post($otpurl, $data);

        if ($response->failed()) {

            // Remove OTP if SMS failed
            DB::table('get_otp')
                ->where('mobile', $mobile)
                ->delete();

            return response()->json([
                'success' => false,
                'message' => 'Unable to send OTP.',
                'api_response' => $response->json() ?? $response->body(),
            ], 500);
        }

        return response()->json([
            'success' => true,
            'message' => 'OTP sent successfully.',
            'mobile' => $mobile,
            'expires_at' => $expiresAt,
        ], 200);

    } catch (\Exception $e) {

        return response()->json([
            'success' => false,
            'message' => 'OTP API connection failed.',
        ], 500);
    }
}
public function verifyOtp(Request $request)
{
    $request->validate([
        'mobile' => [
            'required',
            'digits:10',
        ],
        'otp' => [
            'required',
            'digits:6',
        ],
    ]);

    $mobile = $request->mobile;
    $otp = $request->otp;

    $otpData = DB::table('get_otp')
        ->where('mobile', $mobile)
        ->first();

    if (!$otpData) {
        return response()->json([
            'success' => false,
            'message' => 'OTP not found. Please request a new OTP.',
        ], 404);
    }

    // Check expiry FIRST
    if (
        $otpData->expires_at &&
        now()->greaterThan($otpData->expires_at)
    ) {
        DB::table('get_otp')
            ->where('mobile', $mobile)
            ->delete();

        return response()->json([
            'success' => false,
            'message' => 'OTP has expired. Please request a new OTP.',
        ], 422);
    }

    // Check OTP
    if ((string) $otpData->otpno !== (string) $otp) {
        return response()->json([
            'success' => false,
            'message' => 'Invalid OTP.',
        ], 422);
    }

    // Delete OTP after successful verification
    DB::table('get_otp')
        ->where('mobile', $mobile)
        ->delete();

    // Remember that this mobile was verified
    Cache::put(
        'company_mobile_verified_' . $mobile,
        true,
        now()->addMinutes(10)
    );

    return response()->json([
        'success' => true,
        'message' => 'OTP verified successfully.',
        'mobile' => $mobile,
    ], 200);
}
    /**
     * Store a newly created resource in storage.
     */
    
    public function store(Request $request)
    {
        $request->validate([
        'ownername' => 'required|string|max:255',
        'companyname' => 'required|string|max:255',

        'mobile' => [
            'required',
            'digits:10',
        ],

    ]);

    $mobile = $request->mobile;

    // Check mobile OTP verification
    $verified = Cache::get(
        'company_mobile_verified_' . $mobile
    );

    if (!$verified) {
        return response()->json([
            'success' => false,
            'message' => 'Please verify your mobile number first.',
        ], 403);
    }
 $user = $request->user();
    // Check duplicate mobile
    $existingCompany = DB::table('companies')
        ->where('mobile', $mobile)
        ->first();

    if ($existingCompany) {
        return response()->json([
            'success' => false,
            'message' => 'A company already exists with this mobile number.',
        ], 409);
    }

    // Create company
    $companyId = DB::table('companies')->insertGetId([
        'ownername' => $request->ownername,
        'companyname' => $request->companyname,
        'mobile' => $mobile,
        'address' => $request->address,
        'city' => $request->city,
        'state' => $request->state,
        'pincode' => $request->pincode,
        'phone' => $request->phone,
        'email' => $request->email,
        'gstno' => $request->gstno,
        'panno' => $request->panno,
        'logo' => $request->logo,
        'remark' => $request->remark,
        'status' => 1,
        'created_at' => now(),
        'updated_at' => now(),
    ]);

    // Remove verification after signup
    Cache::forget(
        'company_mobile_verified_' . $mobile
    );

    $company = DB::table('companies')
        ->where('companyid', $companyId)
        ->first();
    $user->companyid = $companyId;
    $user->save();
    return response()->json([
        'success' => true,
        'message' => 'Company registered successfully.',
        'data' => $company,
    ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }
}
