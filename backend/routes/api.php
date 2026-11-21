<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Models\EmergencyRequest;

Route::post('/receive-gemini-data', function (Request $request) {
    $data = $request->json()->all();

    $needs = $data['needs'] ?? [];
    if (is_string($needs)) {
        $needs = array_values(array_filter(array_map('trim', explode(',', $needs))));
    }

    $record = EmergencyRequest::create([
        'sender'      => $data['sender'] ?? 'Unknown Citizen',
        'mobile'      => $data['mobile'] ?? ($data['phone'] ?? null),
        'raw_message' => $data['raw_message'] ?? 'No message provided',
        'location'    => $data['location'] ?? null,
        'urgency'     => strtoupper($data['urgency'] ?? 'MEDIUM'),
        'needs'       => $needs,
        'summary'     => $data['summary'] ?? ($data['raw_message'] ?? null),
        'status'      => 'PENDING',
    ]);

    return response()->json([
        'success' => true,
        'data'    => $record,
    ], 201);
});


Route::get('/emergency-requests', function () {
    $requests = EmergencyRequest::where('status', '!=', 'COMPLETED')
        ->orderBy('id', 'desc')
        ->get();

    return response()->json([
        'success' => true,
        'data'    => $requests,
    ]);
});

Route::patch('/emergency-requests/{id}/complete', function ($id) {
    $record = EmergencyRequest::find($id);

    if (!$record) {
        return response()->json(['success' => false, 'message' => 'Record not found'], 404);
    }

    $record->update([
        'status'      => 'COMPLETED',
        'assisted_at' => now(),
    ]);

    return response()->json([
        'success' => true,
        'message' => 'Marked as COMPLETED',
        'data'    => $record,
    ]);
});