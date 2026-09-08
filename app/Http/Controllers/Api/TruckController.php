<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Truck;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

class TruckController extends Controller
{
    /**
     * Get all trucks
     */
    public function index(Request $request)
    {
        $user = $request->user();
        $trucks = Truck::where('companyid',$user->companyid)->where('status',1)->orderBy('truckid', 'desc')->get();

        return response()->json([
            'status'  => true,
            'message' => 'Truck list fetched successfully',
            'data'    => $trucks
        ], 200);
    }


    /**
     * Create truck
     */
    public function store(Request $request)
    {
           $user = $request->user();
        $validator = Validator::make($request->all(), [
           'trucknumber' => [
                'required',
                'string',
                'max:255',
                Rule::unique('trucks', 'trucknumber')
                    ->where(function ($query) use ($user) {
                        return $query->where('companyid', $user->companyid);
                    }),
            ], 
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status'  => false,
                'message' => 'Validation failed',
                'errors'  => $validator->errors()
            ], 422);
        }

        $truck = Truck::create([
            'trucknumber' => $request->trucknumber,
            'trucktype'   => $request->trucktype,
            'ownership'   => $request->ownership,
            'supplierid'  => $request->supplierid,
            'status'      => $request->status ?? 1,
            'companyid' => $user->companyid,
        ]);

        return response()->json([
            'status'  => true,
            'message' => 'Truck created successfully',
            'data'    => $truck
        ], 201);
    }


    /**
     * Get single truck
     */
    public function show($id)
    {
        $truck = Truck::find($id);

        if (!$truck) {
            return response()->json([
                'status'  => false,
                'message' => 'Truck not found'
            ], 404);
        }

        return response()->json([
            'status'  => true,
            'message' => 'Truck fetched successfully',
            'data'    => $truck
        ], 200);
    }


    /**
     * Update truck
     */
    public function update(Request $request, $id)
    {
        $truck = Truck::find($id);

        if (!$truck) {
            return response()->json([
                'status'  => false,
                'message' => 'Truck not found'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'trucknumber' => 'required|string|max:255|unique:trucks,trucknumber,' . $id . ',truckid',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status'  => false,
                'message' => 'Validation failed',
                'errors'  => $validator->errors()
            ], 422);
        }

        $truck->update([
            'trucknumber' => $request->trucknumber,
            'trucktype'   => $request->trucktype,
            'ownership'   => $request->ownership,
            'supplierid'  => $request->supplierid,
            'status'      => $request->status ?? $truck->status,
        ]);

        return response()->json([
            'status'  => true,
            'message' => 'Truck updated successfully',
            'data'    => $truck->fresh()
        ], 200);
    }


    /**
     * Delete truck
     */
    public function destroy($id)
    {
        $truck = Truck::find($id);

        if (!$truck) {
            return response()->json([
                'status'  => false,
                'message' => 'Truck not found'
            ], 404);
        }

        $truck->delete();

        return response()->json([
            'status'  => true,
            'message' => 'Truck deleted successfully'
        ], 200);
    }
}
?>