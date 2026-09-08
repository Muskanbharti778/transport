<?php

namespace App\Http\Controllers\Api;
use App\Models\City;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class CityController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $cities = City::with('state:stateid,statename')
        ->orderBy('cityid', 'desc')
        ->get();

    $data = $cities->map(function ($city) {
        return [
            'cityid'    => $city->cityid,
            'cityname'  => $city->cityname,
            'statename' => $city->state->statename ?? null
        ];
    });

    return response()->json([
        'status'  => true,
        'message' => 'City list fetched successfully',
        'data'    => $data
    ], 200);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
       $request->validate([
        'stateid'  => 'required|integer|exists:states,stateid',
        'cityname' => 'required|string|max:255',
    ]);

    // Check duplicate city in same state
    $exists = City::where('stateid', $request->stateid)
        ->whereRaw('LOWER(cityname) = ?', [strtolower(trim($request->cityname))])
        ->exists();

    if ($exists) {
        return response()->json([
            'status'  => false,
            'message' => 'City already exists in this state',
            'data'    => null
        ], 409);
    }

    // Create city
    $city = City::create([
        'stateid'  => $request->stateid,
        'cityname' => trim($request->cityname),
        'status'   => 1,
    ]);

    // Get state name
    $city->load('state:stateid,statename');

    return response()->json([
        'status'  => true,
        'message' => 'City added successfully',
        'data'    => [
            'cityid'    => $city->cityid,
            'cityname'  => $city->cityname,
            'statename' => $city->state->statename ?? null,
            'status'    => $city->status,
        ]
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
