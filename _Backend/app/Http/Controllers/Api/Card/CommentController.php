<?php

namespace App\Http\Controllers\Api\Card;

use App\Http\Controllers\Controller;
use App\Models\Comment;
use App\Models\Card;
use App\Models\Board;
use App\Models\Notification;
use App\Events\NotificationCreated;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

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

        // Create notification for board members
        $board = Board::findOrFail($card->board_id);
        $currentUser = Auth::user();

        try {
            // Notify all board members except the current user
            $board->users()
                ->where('user_id', '!=', $currentUser->id)
                ->get()
                ->each(function($user) use ($currentUser, $card) {
                    $notification = Notification::create([
                        'user_id' => $user->id,
                        'type' => 'card_comment',
                        'title' => 'New Comment',
                        'message' => $currentUser->username . ' commented on card "' . $card->title . '"',
                        'data' => json_encode([
                            'card_id' => (string)$card->id,
                            'board_id' => (string)$card->board_id,
                            'actor' => $currentUser->username
                        ])
                    ]);

                    try {
                        broadcast(new NotificationCreated($notification));
                    } catch (\Exception $e) {
                        Log::warning('Failed to broadcast comment notification: ' . $e->getMessage());
                    }
                });
        } catch (\Exception $e) {
            Log::warning('Failed to create comment notifications: ' . $e->getMessage());
        }

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
