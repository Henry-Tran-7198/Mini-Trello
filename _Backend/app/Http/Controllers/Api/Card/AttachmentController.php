<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Attachment;
use Illuminate\Http\Request;

class AttachmentController extends Controller
{
    public function store(Request $request)
    {
        $data = $request->validate([
            'card_id'  => 'required|exists:cards,id',
            'fileName' => 'required|string',
            'fileType' => 'required|string',
            'fileURL'  => 'required|string'
        ]);

        return Attachment::create($data);
    }

    public function destroy($id)
    {
        Attachment::findOrFail($id)->delete();
        return response()->json(['message' => 'Attachment deleted']);
    }
}
