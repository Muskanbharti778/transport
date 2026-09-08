<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Charge;
class ChargeController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
       $charges = Charge::where('status', 1)
            ->orderBy('chargename', 'asc')
            ->get();

        return response()->json([
            'status' => true,
            'message' => 'Charges fetched successfully.',
            'data' => $charges
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $exists = Charge::where('chargename', $request->chargename)->exists();

        if ($exists) {
            return response()->json([
                'status' => false,
                'message' => 'Charge name already exists.'
            ], 409);
        }

        $charge = Charge::create([
            'chargename' => $request->chargename,
            'status' => $request->status ?? 1,
        ]);

        return response()->json([
            'status' => true,
            'message' => 'Charge created successfully.',
            'data' => $charge
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
       $charge = Charge::find($id);

        if (!$charge) {
            return response()->json([
                'status' => false,
                'message' => 'Charge not found.'
            ], 404);
        }

        return response()->json([
            'status' => true,
            'message' => 'Charge fetched successfully.',
            'data' => $charge
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $charge = Charge::find($id);

        if (!$charge) {
            return response()->json([
                'status' => false,
                'message' => 'Charge not found.'
            ], 404);
        }


        // Check duplicate except current charge
        if ($request->filled('chargename')) {

            $exists = Charge::where('chargename', $request->chargename)
                ->where('cid', '!=', $id)
                ->exists();

            if ($exists) {
                return response()->json([
                    'status' => false,
                    'message' => 'Charge name already exists.'
                ], 409);
            }
        }

        $charge->update($request->only([
            'chargename',
            'status'
        ]));

        return response()->json([
            'status' => true,
            'message' => 'Charge updated successfully.',
            'data' => $charge
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
       $charge = Charge::find($id);

        if (!$charge) {
            return response()->json([
                'status' => false,
                'message' => 'Charge not found.'
            ], 404);
        }

        $charge->delete();

        return response()->json([
            'status' => true,
            'message' => 'Charge deleted successfully.'
        ]);
    }
}
