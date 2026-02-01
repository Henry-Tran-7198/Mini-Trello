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
        $users = [];

        foreach ($board->users as $user) {
            $users[] = [
                'id' => (string) $user->id,
                'username' => $user->username,
                'email' => $user->email,
                'avatar' => $user->avatar,
                'role' => $user->pivot->role
            ];

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
                'users' => $users,
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
        $isOwner = $board->users()->wherePivot('role', 'owner')->where('user_id', Auth::id())->exists();
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
        $isOwner = $board->users()->wherePivot('role', 'owner')->where('user_id', Auth::id())->exists();
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

    /**
     * GET BOARD MEMBERS
     */
    public function getMembers($id)
    {
        $board = Board::with('users')->findOrFail($id);

        $members = [];
        foreach ($board->users as $user) {
            $members[] = [
                'id' => (string) $user->id,
                'username' => $user->username,
                'email' => $user->email,
                'avatar' => $user->avatar,
                'role' => $user->pivot->role
            ];
        }

        return response()->json([
            'members' => $members
        ]);
    }

    /**
     * INVITE MEMBER TO BOARD
     */
    public function inviteMember(Request $request, $id)
    {
        $board = Board::findOrFail($id);

        // Kiểm tra quyền
        $isOwner = $board->users()->wherePivot('role', 'owner')->where('user_id', Auth::id())->exists();
        if (!$isOwner) {
            return response()->json([
                'message' => 'Unauthorized - Only owner can invite members'
            ], 403);
        }

        $request->validate([
            'user_id' => 'required|exists:users,id'
        ]);

        $userId = $request->user_id;

        // Kiểm tra user đã là member chưa
        $alreadyMember = $board->users()->where('user_id', $userId)->exists();
        if ($alreadyMember) {
            return response()->json([
                'message' => 'User is already a member of this board'
            ], 400);
        }

        // Add user to board
        $board->users()->attach($userId, [
            'role' => 'member'
        ]);

        $user = \App\Models\User::find($userId);

        return response()->json([
            'message' => 'Member invited successfully',
            'member' => [
                'id' => (string) $user->id,
                'username' => $user->username,
                'email' => $user->email,
                'avatar' => $user->avatar,
                'role' => 'member'
            ]
        ], 201);
    }

    /**
     * REMOVE MEMBER FROM BOARD
     */
    public function removeMember($id, $userId)
    {
        $board = Board::findOrFail($id);

        // Kiểm tra quyền
        $isOwner = $board->users()->wherePivot('role', 'owner')->where('user_id', Auth::id())->exists();
        if (!$isOwner) {
            return response()->json([
                'message' => 'Unauthorized - Only owner can remove members'
            ], 403);
        }

        // Kiểm tra user là member không
        $isMember = $board->users()->where('user_id', $userId)->exists();
        if (!$isMember) {
            return response()->json([
                'message' => 'User is not a member of this board'
            ], 400);
        }

        // Không được remove owner
        $isOwnerMember = $board->users()->wherePivot('role', 'owner')->where('user_id', $userId)->exists();
        if ($isOwnerMember) {
            return response()->json([
                'message' => 'Cannot remove board owner'
            ], 400);
        }

        $board->users()->detach($userId);

        return response()->json([
            'message' => 'Member removed successfully'
        ]);
    }
}
