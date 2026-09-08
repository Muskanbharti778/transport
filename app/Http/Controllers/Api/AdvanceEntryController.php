<?php

namespace App\Http\Controllers\Api;
use App\Models\Advanceentry;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class AdvanceEntryController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $advances = Advanceentry::where('tripid', $request->tripid)
        ->where('advancetype', $request->advancetype)
        ->orderByDesc('advanceid')
        ->get();

    return response()->json([
        'status' => true,
        'message' => 'Advance entries fetched successfully.',
        'data' => $advances
    ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
         $user = $request->user();
          $advance = Advanceentry::create([
            'amount' => $request->amount,
            'advancename' => $request->advancename,
            'advdate' => $request->advdate,
            'tripid' => $request->tripid,
            'receivedbydriver' => $request->receivedbydriver ?? 0,
            'driverid' => $request->driverid,
            'partyid' => $request->partyid,
            'supplierid' => $request->supplierid,
            'remark' => $request->remark,
            'advancetype' => $request->advancetype,
            'companyid' => $user->companyid,
            'userid' => $user->userid,
        ]);


        return response()->json([
            'status' => true,
            'message' => 'Advance entry created successfully.',
            'data' => $advance
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
          $advance = Advanceentry::find($id);

        if (!$advance) {
            return response()->json([
                'status' => false,
                'message' => 'Advance entry not found.'
            ], 404);
        }


        $advance->update($request->only([
            'amount',
            'advancename',
            'advdate',
            'receivedbydriver',
            'remark',
        ]));


        return response()->json([
            'status' => true,
            'message' => 'Advance entry updated successfully.',
            'data' => $advance
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
         $advance = Advanceentry::find($id);

        if (!$advance) {
            return response()->json([
                'status' => false,
                'message' => 'Advance entry not found.'
            ], 404);
        }


        $advance->delete();


        return response()->json([
            'status' => true,
            'message' => 'Advance entry deleted successfully.'
        ]);
    }
}
