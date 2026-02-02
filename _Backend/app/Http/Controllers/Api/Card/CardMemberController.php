<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use App\Models\Card;
use App\Models\Board;

class CardMemberController extends Controller
{
    public function store(Request $request)
    {
        $data = $request->validate([
            'card_id' => 'required|exists:cards,id',
            'user_id' => 'required|exists:users,id'
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

        DB::table('card_members')->insert($data);

        return response()->json(['message' => 'Member added']);
    }

    public function destroy(Request $request)
    {
        // Check if user is a member of the board
        $card = Card::findOrFail($request->card_id);
        $board = Board::findOrFail($card->board_id);
        $isMember = $board->users()->where('user_id', Auth::id())->exists();
        if (!$isMember) {
            return response()->json([
                'message' => 'Unauthorized - You are not a member of this board'
            ], 403);
        }

        DB::table('card_members')
            ->where('card_id', $request->card_id)
            ->where('user_id', $request->user_id)
            ->delete();

        return response()->json(['message' => 'Member removed']);
    }
}
