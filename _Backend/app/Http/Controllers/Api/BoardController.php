<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Board;
use Illuminate\Http\Request;
use App\Http\Controllers\Api\AuthController;
use Illuminate\Support\Facades\Auth;

class BoardController extends Controller
{
        public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'type' => 'in:public,private'
        ]);

        $board = Board::create([
            'title' => $request->title,
            'description' => $request->description,
            'type' => $request->type ?? 'public',
            '_destroy' => false
        ]);

        // Gán user hiện tại làm OWNER
        $board->users()->attach(Auth::id(), [
            'role' => 'owner'
        ]);

        return response()->json([
            'message' => 'Board created successfully',
            'board' => [
                '_id' => (string) $board->id,
                'title' => $board->title,
                'description' => $board->description,
                'type' => $board->type,
                'ownerIds' => [(string) Auth::id()],
                'memberIds' => [],
                'columnOrderIds' => [],
                'columns' => []
            ]
        ], 201);
    }



    public function show($id)
    {
        $board = Board::with([
            'columns' => fn ($q) => $q->orderBy('orderColumn'),
            'columns.cards' => fn ($q) => $q->orderBy('orderCard'),
            'columns.cards.members',
            'columns.cards.comments',
            'columns.cards.attachments',
            'users'
        ])->findOrFail($id);

        // ownerIds & memberIds
        $ownerIds = [];
        $memberIds = [];

        foreach ($board->users as $user) {
            if ($user->pivot->role === 'owner') {
                $ownerIds[] = (string) $user->id;
            } else {
                $memberIds[] = (string) $user->id;
            }
        }

        $columns = [];
        $columnOrderIds = [];

        foreach ($board->columns as $column) {
            $columnOrderIds[] = (string) $column->id;

            $cards = [];
            $cardOrderIds = [];

            foreach ($column->cards as $card) {
                $cardOrderIds[] = (string) $card->id;

                $cards[] = [
                    '_id' => (string) $card->id,
                    'boardId' => (string) $board->id,
                    'columnId' => (string) $column->id,
                    'title' => $card->title,
                    'description' => $card->description,
                    'cover' => $card->cover,
                    'memberIds' => $card->members->pluck('id')->map(fn ($i) => (string) $i),
                    'comments' => $card->comments->pluck('content'),
                    'attachments' => $card->attachments->pluck('fileURL')
                ];
            }

            // Placeholder card
            if (count($cards) === 0) {
                $placeholderId = 'column-' . $column->id . '-placeholder-card';

                $cards[] = [
                    '_id' => $placeholderId,
                    'boardId' => (string) $board->id,
                    'columnId' => (string) $column->id,
                    'FE_PlaceholderCard' => true
                ];

                $cardOrderIds[] = $placeholderId;
            }

            $columns[] = [
                '_id' => (string) $column->id,
                'boardId' => (string) $board->id,
                'title' => $column->title,
                'cardOrderIds' => $cardOrderIds,
                'cards' => $cards
            ];
        }

        return response()->json([
            'board' => [
                '_id' => (string) $board->id,
                'title' => $board->title,
                'description' => $board->description,
                'type' => $board->type,
                'ownerIds' => $ownerIds,
                'memberIds' => $memberIds,
                'columnOrderIds' => $columnOrderIds,
                'columns' => $columns
            ]
        ]);
    }

    /**
     * GET ALL BOARDS của user hiện tại
     */
    public function index()
    {
        $boards = Board::whereHas('users', function ($q) {
            $q->where('user_id', Auth::id());
        })->get();

        $result = [];
        foreach ($boards as $board) {
            $result[] = [
                '_id' => (string) $board->id,
                'title' => $board->title,
                'description' => $board->description,
                'type' => $board->type
            ];
        }

        return response()->json([
            'boards' => $result
        ]);
    }

    /**
     * UPDATE BOARD (title, description, type)
     */
    public function update(Request $request, $id)
    {
        $board = Board::findOrFail($id);

        // Kiểm tra xem user có quyền chỉnh sửa board này không
        $isOwner = $board->users()->where('user_id', Auth::id())->where('role', 'owner')->exists();
        if (!$isOwner) {
            return response()->json([
                'message' => 'Unauthorized'
            ], 403);
        }

        $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'type' => 'in:public,private'
        ]);

        $board->update($request->only([
            'title',
            'description',
            'type'
        ]));

        return response()->json([
            'message' => 'Board updated successfully',
            'board' => [
                '_id' => (string) $board->id,
                'title' => $board->title,
                'description' => $board->description,
                'type' => $board->type
            ]
        ]);
    }

    /**
     * DELETE BOARD (soft delete)
     */
    public function destroy($id)
    {
        $board = Board::findOrFail($id);

        // Kiểm tra quyền
        $isOwner = $board->users()->where('user_id', Auth::id())->where('role', 'owner')->exists();
        if (!$isOwner) {
            return response()->json([
                'message' => 'Unauthorized'
            ], 403);
        }

        $board->_destroy = 1;
        $board->save();

        return response()->json([
            'message' => 'Board deleted successfully'
        ]);
    }
}
