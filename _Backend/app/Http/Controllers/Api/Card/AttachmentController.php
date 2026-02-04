<?php

namespace App\Http\Controllers\Api\Card;

use App\Http\Controllers\Controller;
use App\Models\Attachment;
use App\Models\Card;
use App\Models\Board;
use App\Models\Notification;
use App\Events\NotificationCreated;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

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

        $attachment = Attachment::create($data);

        // Create notification for board members
        $currentUser = Auth::user();

        try {
            // Notify all board members except the current user
            $board->users()
                ->where('user_id', '!=', $currentUser->id)
                ->get()
                ->each(function($user) use ($currentUser, $card, $data) {
                    $notification = Notification::create([
                        'user_id' => $user->id,
                        'type' => 'card_attachment',
                        'title' => 'New Attachment',
                        'message' => $currentUser->username . ' added attachment to card "' . $card->title . '"',
                        'data' => json_encode([
                            'card_id' => (string)$card->id,
                            'board_id' => (string)$card->board_id,
                            'fileName' => $data['fileName'],
                            'actor' => $currentUser->username
                        ])
                    ]);

                    try {
                        broadcast(new NotificationCreated($notification));
                    } catch (\Exception $e) {
                        Log::warning('Failed to broadcast attachment notification: ' . $e->getMessage());
                    }
                });
        } catch (\Exception $e) {
            Log::warning('Failed to create attachment notifications: ' . $e->getMessage());
        }

        return $attachment;
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
