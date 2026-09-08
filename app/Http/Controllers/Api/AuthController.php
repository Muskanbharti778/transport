<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'username' => 'required|string|max:255',
            'email' => 'required|email|max:255|unique:users,email',
            'mobile' => 'required|string|max:20|unique:users,mobile',
            'password' => 'required|string|min:6',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $user = User::create([
            'username' => $request->username,
            'email' => $request->email,
            'mobile' => $request->mobile,
            'password' => Hash::make($request->password),
        ]);

        $token = $user->createToken('mobile-app')->plainTextToken;

        return response()->json([
            'status' => true,
            'message' => 'Account created successfully',
            'data' => [
                'userid' => $user->userid,
                'username' => $user->username,
                'email' => $user->email,
                'mobile' => $user->mobile,
                'token' => $token,
            ],
        ], 201);
    }


public function login(Request $request)
{
    $validator = Validator::make($request->all(), [
        'login' => 'required|string',
        'password' => 'required|string',
    ]);

    if ($validator->fails()) {
        return response()->json([
            'status' => false,
            'message' => 'Validation failed',
            'errors' => $validator->errors(),
        ], 422);
    }

    // Find user by email OR mobile
    $user = User::where('email', $request->login)
                ->orWhere('mobile', $request->login)
                ->first();

    // Check user and password
    if (!$user || !Hash::check($request->password, $user->password)) {
        return response()->json([
            'status' => false,
            'message' => 'Invalid email/mobile or password',
        ], 401);
    }

    // Create Sanctum token
    $token = $user->createToken('mobile-app')->plainTextToken;

    return response()->json([
        'status' => true,
        'message' => 'Login successful',
        'data' => [
            'userid' => $user->userid,
            'username' => $user->username,
            'email' => $user->email,
            'mobile' => $user->mobile,
            'token' => $token,
        ],
    ], 200);
}
public function logout(Request $request)
{
    $request->user()->currentAccessToken()->delete();

    return response()->json([
        'status' => true,
        'message' => 'Logout successful',
    ], 200);
}
}