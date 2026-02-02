<?php

namespace App\Http\Controllers\Api\Card;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use App\Models\Card;
use App\Models\Board;
use App\Models\Notification;
use App\Events\NotificationCreated;

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

        // Create notification for assigned user
        $currentUser = Auth::user();
        $assignedUserId = $data['user_id'];

        try {
            $notification = Notification::create([
                'user_id' => $assignedUserId,
                'type' => 'card_assignment',
                'title' => 'Assigned to Card',
                'message' => $currentUser->username . ' assigned you to card "' . $card->title . '"',
                'data' => json_encode([
                    'card_id' => (string)$card->id,
                    'board_id' => (string)$card->board_id,
                    'actor' => $currentUser->username
                ])
            ]);

            try {
                broadcast(new NotificationCreated($notification));
            } catch (\Exception $e) {
                Log::warning('Failed to broadcast assignment notification: ' . $e->getMessage());
            }
        } catch (\Exception $e) {
            Log::warning('Failed to create assignment notification: ' . $e->getMessage());
        }

        // Also notify other board members
        try {
            $board->users()
                ->where('user_id', '!=', $currentUser->id)
                ->where('user_id', '!=', $assignedUserId)
                ->get()
                ->each(function($user) use ($currentUser, $card) {
                    $notification = Notification::create([
                        'user_id' => $user->id,
                        'type' => 'card_update',
                        'title' => 'Card Updated',
                        'message' => $currentUser->username . ' assigned member to card "' . $card->title . '"',
                        'data' => json_encode([
                            'card_id' => (string)$card->id,
                            'board_id' => (string)$card->board_id,
                            'actor' => $currentUser->username
                        ])
                    ]);

                    try {
                        broadcast(new NotificationCreated($notification));
                    } catch (\Exception $e) {
                        Log::warning('Failed to broadcast update notification: ' . $e->getMessage());
                    }
                });
        } catch (\Exception $e) {
            Log::warning('Failed to create board member notifications: ' . $e->getMessage());
        }

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
