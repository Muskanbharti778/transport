<?php

namespace App\Http\Controllers\Api;
use App\Models\Driver;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
class DriverController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
          $user = $request->user();
     $drivers = Driver::where('companyid',$user->companyid)->where('status',1)->orderBy('driverid', 'desc')->get();
        return response()->json([ 'status' => true, 'message' => 'Driver list fetched successfully', 
        'data' => $drivers], 200);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $user = $request->user();
          $validator = Validator::make($request->all(), [
            'drivername'       => 'required|string|max:255',
              'mobile' => [
                'required',
                'string',
                'max:20',
                Rule::unique('drivers', 'mobile')
                    ->where(function ($query) use ($user) {
                        return $query->where('companyid', $user->companyid);
                    }),
            ],

             'driverphoto' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:2048',
       ]);

        if ($validator->fails()) {
            return response()->json([
                'status'  => false,
                'message' => 'Validation failed',
                'errors'  => $validator->errors(),
            ], 422);
        }
$photoPath = null;

        if ($request->hasFile('driverphoto')) {
            $photoPath = $request->file('driverphoto')
                ->store('drivers', 'public');
        }
        $driver = Driver::create([
            'drivername'      => $request->drivername,
            'mobile'          => $request->mobile,
            'opening_balance' => $request->opening_balance,
            'balance_type'    => $request->balance_type,
            'status'          => 1,
             'driverphoto'     => $photoPath,
             'companyid' => $user->companyid,
        ]);

        return response()->json([
            'status'  => true,
            'message' => 'Driver created successfully',
        ], 201);
    
    }

    /**
     * Display the specified resource.
     */
    public function show($id)
    {
        $driver = Driver::find($id);
       if (!$driver) { return response()->json([ 'status' => false, 
       'message' => 'Driver not found' ], 404); } 
      return response()->json([ 'status' => true, 
      'message' => 'Driver fetched successfully', 'data' => $driver ], 200);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request,$id)
    {
        $driver = Driver::find($id); 
       if (!$driver) { 
        return response()->json([ 'status' => false, 'message' => 'Driver not found' ], 404); }
         $validator = Validator::make($request->all(), [ 'drivername' => 'required|string|max:255', 'mobile' => 'nullable|string|max:20',
         'driverphoto' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:2048']);
          if ($validator->fails()) { 
            return response()->json([ 'status' => false, 'message' => 'Validation failed', 'errors' => $validator->errors() ], 422); }
            
              $data = [
            'drivername' => $request->drivername,
            'mobile' => $request->mobile ?? $driver->mobile,
            'opening_balance' => $request->opening_balance ?? $driver->opening_balance,
            'balance_type' => $request->balance_type ?? $driver->balance_type,
            'status' => $request->status ?? $driver->status,
        ];
             if ($request->hasFile('driverphoto')) {

            // Delete old photo
            if ($driver->driverphoto) {
                Storage::disk('public')->delete($driver->driverphoto);
            }

            $data['driverphoto'] = $request->file('driverphoto')
                ->store('drivers', 'public');
        }

        $driver->update($data);
       return response()->json([ 'status' => true, 'message' => 'Driver updated successfully', 'data' => $driver->fresh() ], 200);
  
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        $driver = Driver::find($id); 
        if (!$driver) {
             return response()->json([ 'status' => false,
              'message' => 'Driver not found' ], 404); } 
          if ($driver->driverphoto) {
            Storage::disk('public')->delete($driver->driverphoto);
        }

        $driver->delete();

         return response()->json([ 'status' => true, 
         'message' => 'Driver deleted successfully' ], 200);
    }
}
