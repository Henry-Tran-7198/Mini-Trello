<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Attachment;
use App\Models\Card;
use App\Models\Board;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

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

        // Check if user is a member of the board
        $card = Card::findOrFail($data['card_id']);
        $board = Board::findOrFail($card->board_id);
        $isMember = $board->users()->where('user_id', Auth::id())->exists();
        if (!$isMember) {
            return response()->json([
                'message' => 'Unauthorized - You are not a member of this board'
            ], 403);
        }

        return Attachment::create($data);
    }

    public function destroy($id)
    {
        $attachment = Attachment::findOrFail($id);

        // Check if user is a member of the board
        $card = Card::findOrFail($attachment->card_id);
        $board = Board::findOrFail($card->board_id);
        $isMember = $board->users()->where('user_id', Auth::id())->exists();
        if (!$isMember) {
            return response()->json([
                'message' => 'Unauthorized - You are not a member of this board'
            ], 403);
        }

        $attachment->delete();
        return response()->json(['message' => 'Attachment deleted']);
    }
}
