<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Party;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
class PartyController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $user = $request->user();
          $parties = Party::where('companyid',$user->companyid)->where('status',1)->orderBy('partyid', 'desc')->get();
        return response()->json([ 'status' => true, 'message' => 'Party list fetched successfully', 
        'data' => $parties], 200);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
         $user = $request->user();
       $validator = Validator::make($request->all(), [
            'partyname'       => 'required|string|max:255',
               'mobile' => [
                'required',
                'string',
                'max:20',
                Rule::unique('parties', 'mobile')
                    ->where(function ($query) use ($user) {
                        return $query->where('companyid', $user->companyid);
                    }),
            ],
       ]);

        if ($validator->fails()) {
            return response()->json([
                'status'  => false,
                'message' => 'Validation failed',
                'errors'  => $validator->errors(),
            ], 422);
        }

        $party = Party::create([
            'partyname'      => $request->partyname,
            'mobile'          => $request->mobile,
            'opening_balance' => $request->opening_balance,
            'companyname'    => $request->companyname,
            'gstno'            => $request->gstno,
            'panno'            => $request->panno,
            'addressline1'    => $request->addressline1,
            'addressline2'    => $request->addressline2,
            'stateid'          => $request->stateid,
            'pincode'          => $request->pincode,
            'status'          => 1,
            'companyid' => $user->companyid,
        ]);

        return response()->json([
            'status'  => true,
            'message' => 'Party created successfully',
            
        ], 201);
    
    }

    /**
     * Display the specified resource.
     */
    public function show($id)
    {
        $party = Party::find($id);
       if (!$party) { return response()->json([ 'status' => false, 
       'message' => 'Party not found' ], 404); } 
      return response()->json([ 'status' => true, 
      'message' => 'Party fetched successfully', 'data' => $party ], 200);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request,$id)
    {
       $party = Party::find($id); 
       if (!$party) { 
        return response()->json([ 'status' => false, 'message' => 'Party not found' ], 404); }
         $validator = Validator::make($request->all(), [ 'partyname' => 'required|string|max:255', 'mobile' => 'nullable|string|max:20']);
          if ($validator->fails()) { 
            return response()->json([ 'status' => false, 'message' => 'Validation failed', 'errors' => $validator->errors() ], 422); }
            
            $party->update([ 'partyname' => $request->partyname, 'mobile' => $request->mobile, 'opening_balance' => $request->opening_balance ?? $party->opening_balance,
             'companyname' => $request->companyname, 'gstno' => $request->gstno,
             'panno' => $request->panno, 'addressline1' => $request->addressline1,
              'addressline2' => $request->addressline2, 'stateid' => $request->stateid,
               'pincode' => $request->pincode, 'status' => $request->status ?? $party->status, ]); 
       return response()->json([ 'status' => true, 'message' => 'Party updated successfully', 'data' => $party->fresh() ], 200);
  
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        $party = Party::find($id); 
        if (!$party) {
             return response()->json([ 'status' => false,
              'message' => 'Party not found' ], 404); } 
        $party->delete();
         return response()->json([ 'status' => true, 
         'message' => 'Party deleted successfully' ], 200);
    }
}
