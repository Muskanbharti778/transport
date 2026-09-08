<?php

namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;
use App\Models\Expense;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class ExpenseController extends Controller
{
    /**
     * Display all expense heads.
     */
    public function index()
    {
        $expenses = Expense::orderBy('expid', 'desc')->get();

        return response()->json([
            'status' => true,
            'message' => 'Expense heads fetched successfully',
            'data' => $expenses
        ], 200);
    }

    /**
     * Store a new expense head.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'expensename' => 'required|string|max:255',
            'exptype' => [
                'required',
                Rule::in([
                    'office',
                    'trip',
                    'maintenance',
                    'driver'
                ])
            ],
            'status' => 'nullable|boolean',
        ]);

        $expense = Expense::create([
            'expensename' => $validated['expensename'],
            'exptype' => $validated['exptype'],
            'status' => $validated['status'] ?? 1,
        ]);

        return response()->json([
            'status' => true,
            'message' => 'Expense head created successfully',
            'data' => $expense
        ], 201);
    }

    /**
     * Display a specific expense head.
     */
    public function show($expid)
    {
        $expense = Expense::find($expid);

        if (!$expense) {
            return response()->json([
                'status' => false,
                'message' => 'Expense head not found'
            ], 404);
        }

        return response()->json([
            'status' => true,
            'message' => 'Expense head fetched successfully',
            'data' => $expense
        ], 200);
    }

    /**
     * Update an expense head.
     */
    public function update(Request $request, $expid)
    {
        $expense = Expense::find($expid);

        if (!$expense) {
            return response()->json([
                'status' => false,
                'message' => 'Expense head not found'
            ], 404);
        }

        $validated = $request->validate([
            'expensename' => 'required|string|max:255',
            'exptype' => [
                'required',
                Rule::in([
                    'office',
                    'trip',
                    'maintenance',
                    'driver'
                ])
            ],
            'status' => 'nullable|boolean',
        ]);

        $expense->update([
            'expensename' => $validated['expensename'],
            'exptype' => $validated['exptype'],
            'status' => $validated['status'] ?? $expense->status,
        ]);

        return response()->json([
            'status' => true,
            'message' => 'Expense head updated successfully',
            'data' => $expense
        ], 200);
    }

    /**
     * Delete an expense head.
     */
    public function destroy($expid)
    {
        $expense = Expense::find($expid);

        if (!$expense) {
            return response()->json([
                'status' => false,
                'message' => 'Expense head not found'
            ], 404);
        }

        $expense->delete();

        return response()->json([
            'status' => true,
            'message' => 'Expense head deleted successfully'
        ], 200);
    }
}