<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Comment;
use App\Models\Card;
use App\Models\Board;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class CommentController extends Controller
{
    public function store(Request $request)
    {
        $data = $request->validate([
            'card_id' => 'required|exists:cards,id',
            'user_id' => 'required|exists:users,id',
            'content' => 'required|string'
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

        // Add createdAt timestamp if timestamps are disabled in model
        $data['createdAt'] = now();

        $comment = Comment::create($data);

        // Return comment with user data
        $comment->load('user:id,username,avatar');

        return response()->json([
            'message' => 'Comment created successfully',
            'comment' => [
                'id' => (string) $comment->id,
                'content' => $comment->content,
                'createdAt' => $comment->createdAt,
                'user' => [
                    'id' => (string) $comment->user->id,
                    'username' => $comment->user->username,
                    'avatar' => $comment->user->avatar
                ]
            ]
        ], 201);
    }

    public function destroy($id)
    {
        $comment = Comment::findOrFail($id);

        // Check if user is a member of the board
        $card = Card::findOrFail($comment->card_id);
        $board = Board::findOrFail($card->board_id);
        $isMember = $board->users()->where('user_id', Auth::id())->exists();
        if (!$isMember) {
            return response()->json([
                'message' => 'Unauthorized - You are not a member of this board'
            ], 403);
        }

        $comment->delete();
        return response()->json(['message' => 'Comment deleted']);
    }
}
