<?php

namespace App\Http\Controllers\Api;
use App\Models\Trippayment;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
class TripPaymentController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
         $user = $request->user();
      $payments = Trippayment::where('companyid',$user->companyid)->orderByDesc('paymentid') ->get();
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $user = $request->user();
       $validator = Validator::make($request->all(), [ 'amount' => 'required|numeric|min:0',
       'paymentdate' => 'nullable|date', ]);
       if ($validator->fails()) { return response()->json([ 'status' => false, 'message' => 'Validation failed.', 'errors' => $validator->errors() ], 422); }
       $payment = Trippayment::create([ 'amount' => $request->amount,
       'paymentdate' => $request->paymentdate, 'tripid' => $request->tripid, 
       'paymenttype' => $request->paymenttype, 'paymentmode' => $request->paymentmode,
       'remark' => $request->remark, 'companyid' => $user->companyid, 'userid' => $user->userid, ]); 
       
       return response()->json([ 'status' => true, 'message' => 'Trip payment created successfully.', 'data' => $payment ], 201);
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
       $payment = Trippayment::find($id); if (!$payment) { return response()->json([ 'status' => false, 'message' => 'Trip payment not found.' ], 404); } 
       $validator = Validator::make($request->all(), [ 'amount' => 'sometimes|required|numeric|min:0', 
       'paymentdate' => 'nullable|date', ]);
       if ($validator->fails()) { return response()->json([ 'status' => false, 'message' => 'Validation failed.', 'errors' => $validator->errors() ], 422); } 
       $payment->update($request->only([ 'amount', 'paymentdate','paymenttype', 'paymentmode', 'remark',  ]));
       return response()->json([ 'status' => true, 'message' => 'Trip payment updated successfully.', 'data' => $payment ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
       $payment = Trippayment::find($id); if (!$payment) { return response()->json([ 'status' => false, 'message' => 'Trip payment not found.' ], 404); } 
       $payment->delete(); return response()->json([ 'status' => true, 'message' => 'Trip payment deleted successfully.' ]);
    }
}
