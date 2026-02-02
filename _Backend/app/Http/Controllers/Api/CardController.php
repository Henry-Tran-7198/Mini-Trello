<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Column;
use App\Models\Card;
use App\Models\Board;
use App\Models\Notification;
use App\Events\NotificationCreated;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class CardController extends Controller
{
    // CREATE CARD
    public function store(Request $request)
    {
        $request->validate([
            'boardId'  => 'required|exists:boards,id',
            'columnId' => 'required|exists:columns,id',
            'title'    => 'required|string|max:255',
            'cover'    => 'nullable|string',
            'description' => 'nullable|string'
        ]);

        // Check if user is a member of the board
        $board = Board::findOrFail($request->boardId);
        $isMember = $board->users()->where('user_id', Auth::id())->exists();
        if (!$isMember) {
            return response()->json([
                'message' => 'Unauthorized - You are not a member of this board'
            ], 403);
        }

        $column = Column::where('id', $request->columnId)
            ->where('board_id', $request->boardId)
            ->first();

        if (!$column) {
            return response()->json([
                'message' => 'Column does not belong to this board'
            ], 422);
        }

        $maxOrder = Card::where('column_id', $column->id)->max('orderCard') ?? 0;

        $card = Card::create([
            'board_id'   => $request->boardId,
            'column_id'  => $request->columnId,
            'title'      => $request->title,
            'description'=> $request->description ?? null,
            'cover'      => $request->cover ?? null,
            'orderCard'  => $maxOrder + 1,
            '_destroy'   => 0
        ]);

        return response()->json([
            'message' => 'Card created',
            'card' => [
                '_id' => (string)$card->id,
                'boardId' => (string)$card->board_id,
                'columnId' => (string)$card->column_id,
                'title' => $card->title,
                'description' => $card->description,
                'cover' => $card->cover,
                'memberIds' => [],
                'comments' => [],
                'attachments' => []
            ]
        ], 201);
    }


    // CARD DETAIL (modal)
    public function show($id)
    {
        $card = Card::with([
            'members:id,username,email,avatar',
            'comments.user:id,username,avatar',
            'attachments'
        ])->findOrFail($id);

        return response()->json([
            'card' => [
                'id' => (string) $card->id,
                'title' => $card->title,
                'description' => $card->description,
                'cover' => $card->cover,
                'members' => $card->members->map(fn($member) => [
                    'id' => (string) $member->id,
                    'username' => $member->username,
                    'email' => $member->email,
                    'avatar' => $member->avatar
                ])->toArray(),
                'comments' => $card->comments->map(fn($comment) => [
                    'id' => (string) $comment->id,
                    'content' => $comment->content,
                    'createdAt' => $comment->createdAt,
                    'user' => [
                        'id' => (string) $comment->user->id,
                        'username' => $comment->user->username,
                        'avatar' => $comment->user->avatar
                    ]
                ])->toArray(),
                'attachments' => $card->attachments->map(fn($attachment) => [
                    'id' => (string) $attachment->id,
                    'fileName' => $attachment->fileName,
                    'fileType' => $attachment->fileType,
                    'fileURL' => $attachment->fileURL,
                    'createdAt' => $attachment->createdAt
                ])->toArray()
            ]
        ]);
    }

    /**
     * UPDATE CARD (title, description, cover)
     */
    public function update(Request $request, $id)
    {
        $card = Card::findOrFail($id);

        // Check if user is a member of the board
        $board = Board::findOrFail($card->board_id);
        $isMember = $board->users()->where('user_id', Auth::id())->exists();
        if (!$isMember) {
            return response()->json([
                'message' => 'Unauthorized - You are not a member of this board'
            ], 403);
        }

        $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'cover' => 'nullable|string'
        ]);

        $card->update($request->only([
            'title',
            'description',
            'cover'
        ]));

        return response()->json([
            'message' => 'Card updated successfully',
            'card' => [
                '_id' => (string) $card->id,
                'boardId' => (string) $card->board_id,
                'columnId' => (string) $card->column_id,
                'title' => $card->title,
                'description' => $card->description,
                'cover' => $card->cover
            ]
        ]);
    }

    /**
     * MOVE CARD (drag & drop) - OPTIMIZED
     * Stable implementation using DB transactions to prevent race conditions
     * Reduces N+1 queries with efficient DB operations
     */
    public function move(Request $request, $id)
    {
        \Log::info('🟡 Card move START - Before any DB operations', [
            'card_id_param' => $id,
            'user_id' => Auth::id(),
            'request_data' => $request->all(),
            'headers' => $request->headers->all()
        ]);

        try {
            $card = Card::findOrFail($id);
        } catch (\Exception $e) {
            \Log::error('❌ Card not found:', [
                'card_id' => $id,
                'error' => $e->getMessage()
            ]);
            throw $e;
        }

        $oldColumnId = $card->column_id;

        // Check if user is a member of the board
        $board = Board::findOrFail($card->board_id);
        $isMember = $board->users()->where('user_id', Auth::id())->exists();

        \Log::info('🟡 Card move auth check', [
            'board_id' => $board->id,
            'is_member' => $isMember,
            'user_id' => Auth::id()
        ]);

        if (!$isMember) {
            \Log::warning('❌ Card move: User not member of board');
            return response()->json([
                'message' => 'Unauthorized - You are not a member of this board'
            ], 403);
        }

        $request->validate([
            'toColumnId' => 'required|exists:columns,id',
            'orderCard'  => 'required|integer|min:0'
        ]);

        $newColumnId = $request->toColumnId;
        $newOrderCard = $request->orderCard;

        \Log::info('🟡 Card move params', [
            'old_column_id' => $oldColumnId,
            'new_column_id' => $newColumnId,
            'new_order_card' => $newOrderCard
        ]);

        // Use database transaction to ensure consistency
        DB::transaction(function() use (&$card, $oldColumnId, $newColumnId, $newOrderCard, $id) {
            // Step 1: Re-sequence old column (shift remaining cards up)
            Card::where('column_id', $oldColumnId)
                ->where('_destroy', 0)
                ->where('id', '!=', $id)
                ->orderBy('orderCard')
                ->get()
                ->each(function($c, $index) {
                    $c->update(['orderCard' => $index]);
                });

            // Step 2: Move card to new column with temporary high order value
            $card->update([
                'column_id' => $newColumnId,
                'orderCard' => 999
            ]);

            // Step 3: Shift down existing cards in new column from target position onwards
            Card::where('column_id', $newColumnId)
                ->where('_destroy', 0)
                ->where('id', '!=', $id)
                ->where('orderCard', '>=', $newOrderCard)
                ->increment('orderCard');

            // Step 4: Set moved card to final position
            $card->update(['orderCard' => $newOrderCard]);
        });

        // Refresh card data from database to get latest values
        $card->refresh();

        \Log::info('✅ Card moved successfully', [
            'card_id' => $card->id,
            'column_id' => $card->column_id,
            'order_card' => $card->orderCard
        ]);

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
                        'type' => 'card_move',
                        'title' => 'Card Moved',
                        'message' => $currentUser->username . ' moved card "' . $card->title . '"',
                        'data' => json_encode([
                            'card_id' => (string)$card->id,
                            'board_id' => (string)$card->board_id,
                            'actor' => $currentUser->username
                        ])
                    ]);

                    try {
                        broadcast(new NotificationCreated($notification));
                    } catch (\Exception $e) {
                        \Log::warning('Failed to broadcast card move notification: ' . $e->getMessage());
                    }
                });
        } catch (\Exception $e) {
            \Log::warning('Failed to create card move notifications: ' . $e->getMessage());
        }

        return response()->json([
            'message' => 'Card moved successfully',
            'card' => [
                '_id' => (string)$card->id,
                'boardId' => (string)$card->board_id,
                'columnId' => (string)$card->column_id,
                'title' => $card->title,
                'orderCard' => (int)$card->orderCard
            ]
        ]);
    }

    /**
     * DELETE CARD (soft delete)
     */
    public function destroy($id)
    {
        $card = Card::findOrFail($id);

        // Check if user is a member of the board
        $board = Board::findOrFail($card->board_id);
        $isMember = $board->users()->where('user_id', Auth::id())->exists();
        if (!$isMember) {
            return response()->json([
                'message' => 'Unauthorized - You are not a member of this board'
            ], 403);
        }

        $card->_destroy = 1;
        $card->save();

        return response()->json([
            'message' => 'Card deleted successfully'
        ]);
    }
}
