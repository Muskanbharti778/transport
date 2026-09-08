<?php

namespace App\Http\Controllers\Api;
use App\Models\Chargeentry;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class ChargeEntryController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
          $entries = Chargeentry::where('tripid', $request->tripid)
            ->orderByDesc('chargeid')
            ->get();

        $totalAdd = $entries
            ->where('billadjustment', 'add')
            ->sum('amount');

        $totalReduce = $entries
            ->where('billadjustment','reduce')
            ->sum('amount');

        $netAmount = $totalAdd - $totalReduce;

        return response()->json([
            'status' => true,
            'message' => 'Charge entries fetched successfully.',
            'totaladd' => number_format($totalAdd, 2, '.', ''),
            'totalreduce' => number_format($totalReduce, 2, '.', ''),
            'netamount' => number_format($netAmount, 2, '.', ''),
            'data' => $entries
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $user = $request->user();
       $entry = Chargeentry::create([
            'cid' => $request->cid,
            'tripid' => $request->tripid,
            'amount' => $request->amount,
            'chargedate' => $request->chargedate,
            'chargetype' => $request->chargetype,
            'billadjustment' => $request->billadjustment,
            'remark' => $request->remark,
            'companyid' => $user->companyid,
            'userid' => $user->userid,
        ]);

        return response()->json([
            'status' => true,
            'message' => 'Charge entry created successfully.',
            'data' => $entry
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
       $entry = Chargeentry::find($id);

        if (!$entry) {
            return response()->json([
                'status' => false,
                'message' => 'Charge entry not found.'
            ], 404);
        }

        return response()->json([
            'status' => true,
            'message' => 'Charge entry fetched successfully.',
            'data' => $entry
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
       $entry = Chargeentry::find($id);

        if (!$entry) {
            return response()->json([
                'status' => false,
                'message' => 'Charge entry not found.'
            ], 404);
        }
        $entry->update($request->only([
            'cid',
            'amount',
            'chargedate',
            'billadjustment',
            'remark',
        ]));

        return response()->json([
            'status' => true,
            'message' => 'Charge entry updated successfully.',
            'data' => $entry
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
          $entry = Chargeentry::find($id);

        if (!$entry) {
            return response()->json([
                'status' => false,
                'message' => 'Charge entry not found.'
            ], 404);
        }

        $entry->delete();

        return response()->json([
            'status' => true,
            'message' => 'Charge entry deleted successfully.'
        ]);
    }
}
