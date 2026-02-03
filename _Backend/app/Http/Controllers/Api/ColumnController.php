<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use App\Models\Column;
use App\Models\Board;
use App\Models\Notification;
use App\Events\NotificationCreated;

class ColumnController extends Controller
{
    /**
     * CREATE COLUMN
     */
    public function store(Request $request)
    {
        $request->validate([
            'boardId' => 'required|exists:boards,id',
            'title' => 'required|string|max:255'
        ]);

        // Check if user is a member of the board
        $board = Board::findOrFail($request->boardId);
        $isMember = $board->users()->where('user_id', Auth::id())->exists();
        if (!$isMember) {
            return response()->json([
                'message' => 'Unauthorized - You are not a member of this board'
            ], 403);
        }

        // Tính orderColumn tiếp theo
        $maxOrder = Column::where('board_id', $request->boardId)->max('orderColumn');
        $nextOrder = is_null($maxOrder) ? 0 : $maxOrder + 1;

        $column = Column::create([
            'board_id' => $request->boardId,
            'title' => $request->title,
            'orderColumn' => $nextOrder,
            '_destroy' => false
        ]);

        // FE yêu cầu placeholder card nếu column rỗng
        $placeholderCardId = 'column-' . $column->id . '-placeholder-card';

        return response()->json([
            '_id' => (string) $column->id,
            'boardId' => (string) $column->board_id,
            'title' => $column->title,
            'cardOrderIds' => [$placeholderCardId],
            'cards' => [
                [
                    '_id' => $placeholderCardId,
                    'boardId' => (string) $column->board_id,
                    'columnId' => (string) $column->id,
                    'FE_PlaceholderCard' => true
                ]
            ]
        ], 201);
    }

    /**
     * UPDATE COLUMN (title)
     */
    public function update(Request $request, $id)
    {
        $column = Column::findOrFail($id);

        // Check if user is a member of the board
        $board = Board::findOrFail($column->board_id);
        $isMember = $board->users()->where('user_id', Auth::id())->exists();
        if (!$isMember) {
            return response()->json([
                'message' => 'Unauthorized - You are not a member of this board'
            ], 403);
        }

        $request->validate([
            'title' => 'sometimes|required|string|max:255'
        ]);

        $column->update($request->only([
            'title'
        ]));

        return response()->json([
            'message' => 'Column updated successfully',
            'column' => [
                '_id' => (string) $column->id,
                'boardId' => (string) $column->board_id,
                'title' => $column->title
            ]
        ]);
    }

    /**
     * UPDATE COLUMN ORDER
     */
    public function updateOrder(Request $request, $boardId)
    {
        $board = Board::findOrFail($boardId);

        // Check if user is a member of the board
        $isMember = $board->users()->where('user_id', Auth::id())->exists();
        if (!$isMember) {
            return response()->json([
                'message' => 'Unauthorized - You are not a member of this board'
            ], 403);
        }

        $request->validate([
            'columnOrderIds' => 'required|array'
        ]);

        $columnOrderIds = $request->columnOrderIds;

        // Update order for each column
        foreach ($columnOrderIds as $index => $columnId) {
            Column::where('id', $columnId)
                ->where('board_id', $boardId)
                ->update(['orderColumn' => $index]);
        }

        // Create notification for board members (only on significant reorder)
        if (count($columnOrderIds) > 0) {
            $currentUser = Auth::user();

            try {
                $board->users()
                    ->where('user_id', '!=', $currentUser->id)
                    ->get()
                    ->each(function($user) use ($currentUser, $boardId) {
                        $notification = Notification::create([
                            'user_id' => $user->id,
                            'type' => 'column_move',
                            'title' => 'Column Reordered',
                            'message' => $currentUser->username . ' reorganized the board columns',
                            'data' => json_encode([
                                'board_id' => (string)$boardId,
                                'actor' => $currentUser->username
                            ])
                        ]);

                        try {
                            broadcast(new NotificationCreated($notification));
                        } catch (\Exception $e) {
                            Log::warning('Failed to broadcast column move notification: ' . $e->getMessage());
                        }
                    });
            } catch (\Exception $e) {
                Log::warning('Failed to create column move notifications: ' . $e->getMessage());
            }
        }

        return response()->json([
            'message' => 'Column order updated successfully',
            'columnOrderIds' => array_map('strval', $columnOrderIds)
        ]);
    }

    /**
     * DELETE COLUMN (soft delete)
     */
    public function destroy($id)
    {
        $column = Column::findOrFail($id);

        // Check if user is a member of the board
        $board = Board::findOrFail($column->board_id);
        $isMember = $board->users()->where('user_id', Auth::id())->exists();
        if (!$isMember) {
            return response()->json([
                'message' => 'Unauthorized - You are not a member of this board'
            ], 403);
        }

        $column->_destroy = 1;
        $column->save();

        return response()->json([
            'message' => 'Column deleted successfully'
        ]);
    }
}
