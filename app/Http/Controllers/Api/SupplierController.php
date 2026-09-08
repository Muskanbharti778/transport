<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Supplier;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

class SupplierController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $user = $request->user();
       $suppliers = Supplier::where('companyid',$user->companyid)->where('status',1)->orderBy('supplierid', 'desc')->get();
        return response()->json([ 'status' => true, 'message' => 'Supplier list fetched successfully', 
        'data' => $suppliers ], 200);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
         $user = $request->user();
        $validator = Validator::make($request->all(),
         [ 'suppliername' => 'required|string|max:255', 
        'mobile' => [
                'required',
                'string',
                'max:20',
                Rule::unique('suppliers', 'mobile')
                    ->where(function ($query) use ($user) {
                        return $query->where('companyid', $user->companyid);
                    }),
            ],
          ]); 
            if ($validator->fails()) { 
                return response()->json([ 'status' => false,
                 'message' => 'Validation failed', 
                 'errors' => $validator->errors() ], 422); } 

                $supplier = Supplier::create([ 'suppliername' => $request->suppliername, 
                'mobile' => $request->mobile, 'email' => $request->email, 
                'address' => $request->address, 'stateid' => $request->stateid,
                 'cityid' => $request->cityid, 'gstno' => $request->gstno, 
                 'panno' => $request->panno, 
                 'contactperson' => $request->contactperson, 
                 'status' => $request->status ?? 1,
                  'companyid' => $user->companyid,
                 ]); 
        return response()->json([ 'status' => true,
         'message' => 'Supplier created successfully',
          'data' => $supplier ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show($id)
    {
      $supplier = Supplier::find($id);
       if (!$supplier) { return response()->json([ 'status' => false, 
       'message' => 'Supplier not found' ], 404); } 
      return response()->json([ 'status' => true, 
      'message' => 'Supplier fetched successfully', 'data' => $supplier ], 200);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id)
    {
       $supplier = Supplier::find($id); 
       if (!$supplier) { 
        return response()->json([ 'status' => false, 'message' => 'Supplier not found' ], 404); }
         $validator = Validator::make($request->all(), [ 'suppliername' => 'required|string|max:255', 'mobile' => 'nullable|string|max:20']);
          if ($validator->fails()) { 
            return response()->json([ 'status' => false, 'message' => 'Validation failed', 'errors' => $validator->errors() ], 422); }
            
            $supplier->update([ 'suppliername' => $request->suppliername, 
            'mobile' => $request->mobile, 'email' => $request->email, 'address' => $request->address,
             'stateid' => $request->stateid, 'cityid' => $request->cityid, 'gstno' => $request->gstno,
              'panno' => $request->panno, 'contactperson' => $request->contactperson, 
              'status' => $request->status ?? $supplier->status, ]); 
       return response()->json([ 'status' => true, 'message' => 'Supplier updated successfully', 'data' => $supplier->fresh() ], 200);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        $supplier = Supplier::find($id); 
        if (!$supplier) {
             return response()->json([ 'status' => false,
              'message' => 'Supplier not found' ], 404); } 
        $supplier->delete();
         return response()->json([ 'status' => true, 
         'message' => 'Supplier deleted successfully' ], 200);
    }
}
