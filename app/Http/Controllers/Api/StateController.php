<?php

namespace App\Http\Controllers\Api;
use App\Models\State;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class StateController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
         $states = State::orderBy('stateid', 'desc')->get();
        return response()->json([ 'status' => true, 'message' => 'State list fetched successfully', 
        'data' => $states], 200);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //
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
