<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Board;
use Illuminate\Http\Request;
use App\Http\Controllers\Api\AuthController;
use Illuminate\Support\Facades\Auth;
use App\Events\MemberRemovedFromBoard;
use App\Events\NotificationCreated;
use App\Events\BoardDeleted;

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

        // Check if current user is a member of this board
        $isMember = $board->users()->where('user_id', Auth::id())->exists();
        if (!$isMember) {
            return response()->json([
                'message' => 'Unauthorized - You are not a member of this board'
            ], 403);
        }

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
                'role' => $user->pivot->role,
                'invitationStatus' => 'accepted'
            ];

            if ($user->pivot->role === 'owner') {
                $ownerIds[] = (string) $user->id;
            } else {
                $memberIds[] = (string) $user->id;
            }
        }

        // Get pending invitations for this board
        $pendingInvitations = \App\Models\Invitation::with('invitee')
            ->where('board_id', $id)
            ->where('status', 'pending')
            ->get();

        foreach ($pendingInvitations as $invitation) {
            $users[] = [
                'id' => (string) $invitation->invitee->id,
                'username' => $invitation->invitee->username,
                'email' => $invitation->invitee->email,
                'avatar' => $invitation->invitee->avatar,
                'role' => 'member',
                'invitationStatus' => 'pending',
                'invitationId' => (string) $invitation->id
            ];
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

        // Get all users in the board (except the current user)
        $boardUsers = $board->users()->where('user_id', '!=', Auth::id())->get();

        // Create notifications and broadcast to all users
        foreach ($boardUsers as $user) {
            // Create notification for each user
            $notification = \App\Models\Notification::create([
                'user_id' => $user->id,
                'type' => 'board_deleted',
                'title' => 'Board đã bị xoá',
                'message' => 'Board "' . $board->title . '" đã bị xoá bởi ' . Auth::user()->username,
                'data' => [
                    'board_id' => (string) $board->id,
                    'board_title' => $board->title,
                    'deleted_by' => Auth::user()->username
                ],
                'is_read' => false
            ]);

            // Broadcast notification to user (real-time)
            try {
                broadcast(new NotificationCreated($notification));
            } catch (\Exception $e) {
                \Log::warning('Failed to broadcast board deletion notification: ' . $e->getMessage());
            }

            // Broadcast board deleted event (for real-time redirect)
            try {
                broadcast(new BoardDeleted(
                    $board->id,
                    $board->title,
                    Auth::user()->username,
                    $user->id
                ));
            } catch (\Exception $e) {
                \Log::warning('Failed to broadcast board deleted event: ' . $e->getMessage());
            }
        }

        // Remove all users from board
        $board->users()->detach();

        // Mark board as deleted
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

        // Kiểm tra có pending invitation không
        $existingInvitation = \App\Models\Invitation::where([
            ['invitee_id', $userId],
            ['board_id', $id],
            ['status', 'pending']
        ])->first();

        if ($existingInvitation) {
            return response()->json([
                'message' => 'Invitation already sent to this user'
            ], 400);
        }

        // Xoá invitation cũ (rejected, ...) để có thể invite lại
        \App\Models\Invitation::where([
            ['invitee_id', $userId],
            ['board_id', $id]
        ])->delete();

        // Create invitation
        $invitation = \App\Models\Invitation::create([
            'inviter_id' => Auth::id(),
            'invitee_id' => $userId,
            'board_id' => $id,
            'type' => 'board_member',
            'status' => 'pending'
        ]);

        // Create notification for invited user
        $notification = \App\Models\Notification::create([
            'user_id' => $userId,
            'type' => 'board_invitation',
            'title' => 'Lời mời vào board',
            'message' => Auth::user()->username . ' mời bạn vào board "' . $board->title . '"',
            'data' => [
                'board_id' => (string) $board->id,
                'board_title' => $board->title,
                'inviter_id' => (string) Auth::id(),
                'inviter_username' => Auth::user()->username,
                'invitation_id' => (string) $invitation->id
            ],
            'is_read' => false
        ]);

        // Broadcast notification to invited user (real-time)
        try {
            broadcast(new NotificationCreated($notification));
        } catch (\Exception $e) {
            // Log broadcast error but don't fail the API
            \Log::warning('Failed to broadcast notification: ' . $e->getMessage());
        }

        return response()->json([
            'message' => 'Invitation sent successfully'
        ]);
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

        // Create notification for removed user
        $notification = \App\Models\Notification::create([
            'user_id' => $userId,
            'type' => 'member_removed',
            'title' => 'Bị xoá khỏi board',
            'message' => 'Bạn đã bị xoá khỏi board "' . $board->title . '" bởi ' . auth()->user()->username,
            'data' => [
                'board_id' => (string) $board->id,
                'board_title' => $board->title,
                'removed_by' => auth()->user()->username
            ],
            'is_read' => false
        ]);

        // Broadcast notification to user
        try {
            broadcast(new NotificationCreated($notification));
        } catch (\Exception $e) {
            \Log::warning('Failed to broadcast notification: ' . $e->getMessage());
        }

        // Broadcast member removal event (for real-time redirect)
        try {
            broadcast(new MemberRemovedFromBoard(
                $board->id,
                $userId,
                $board->title,
                auth()->user()->username
            ));
        } catch (\Exception $e) {
            \Log::warning('Failed to broadcast member removal: ' . $e->getMessage());
        }

        return response()->json([
            'message' => 'Member removed successfully'
        ]);
    }
}
