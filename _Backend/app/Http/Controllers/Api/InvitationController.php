<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Invitation;
use App\Models\Board;
use Illuminate\Http\Request;
use Illuminate\Database\Eloquent\Builder;
use App\Events\NotificationCreated;



class InvitationController extends Controller
{
    /**
     * GET /api/invitations - Get pending invitations for current user
     */
    public function index(Request $request)
    {
        $userId = auth()->id();

        $invitations = Invitation::with(['inviter', 'board'])
            ->where('invitee_id', $userId)
            ->where('status', 'pending')
            ->orderBy('createdAt', 'desc')
            ->get()
            ->map(function ($inv) {
                return [
                    'id' => (string) $inv->id,
                    'inviterId' => (string) $inv->inviter_id,
                    'inviteeId' => (string) $inv->invitee_id,
                    'boardId' => (string) $inv->board_id,
                    'type' => $inv->type,
                    'status' => $inv->status,
                    'inviter' => [
                        'id' => (string) $inv->inviter->id,
                        'username' => $inv->inviter->username,
                        'email' => $inv->inviter->email,
                        'avatar' => $inv->inviter->avatar,
                    ],
                    'board' => [
                        'id' => (string) $inv->board->id,
                        'title' => $inv->board->title,
                        'description' => $inv->board->description,
                    ],
                    'createdAt' => $inv->createdAt,
                ];
            });

        return response()->json([
            'invitations' => $invitations
        ]);
    }

    /**
     * POST /api/invitations/:id/accept - Accept invitation
     */
    public function accept($id)
    {
        $invitation = Invitation::findOrFail($id);

        // Check if user is the invitee
        if ($invitation->invitee_id !== auth()->id()) {
            return response()->json([
                'message' => 'Unauthorized'
            ], 403);
        }

        // Check if already accepted/rejected
        if ($invitation->status !== 'pending') {
            return response()->json([
                'message' => 'Invitation already ' . $invitation->status
            ], 400);
        }

        // Add user to board
        $board = $invitation->board;
        $board->users()->attach(auth()->id(), [
            'role' => 'member',
            'createdAt' => now()
        ]);

        // Update invitation status
        $invitation->update(['status' => 'accepted']);

        // Create notification for inviter
        $notification = \App\Models\Notification::create([
            'user_id' => $invitation->inviter_id,
            'type' => 'member_accepted',
            'title' => 'Chấp nhận lời mời',
            'message' => auth()->user()->username . ' đã chấp nhận lời mời vào board "' . $board->title . '"',
            'data' => [
                'board_id' => (string) $board->id,
                'board_title' => $board->title,
                'user_id' => (string) auth()->id(),
                'username' => auth()->user()->username
            ],
            'is_read' => false
        ]);

        // Broadcast notification to inviter (real-time)
        try {
            broadcast(new NotificationCreated($notification));
        } catch (\Exception $e) {
            \Log::warning('Failed to broadcast acceptance notification: ' . $e->getMessage());
        }

        return response()->json([
            'message' => 'Invitation accepted',
            'invitation' => [
                'id' => (string) $invitation->id,
                'status' => $invitation->status,
            ]
        ]);
    }

    /**
     * POST /api/invitations/:id/reject - Reject invitation
     */
    public function reject($id)
    {
        $invitation = Invitation::findOrFail($id);

        // Check if user is the invitee
        if ($invitation->invitee_id !== auth()->id()) {
            return response()->json([
                'message' => 'Unauthorized'
            ], 403);
        }

        // Check if already accepted/rejected
        if ($invitation->status !== 'pending') {
            return response()->json([
                'message' => 'Invitation already ' . $invitation->status
            ], 400);
        }

        // Update invitation status
        $invitation->update(['status' => 'rejected']);

        // Create notification for inviter about rejection
        $board = $invitation->board;
        $notification = \App\Models\Notification::create([
            'user_id' => $invitation->inviter_id,
            'type' => 'member_rejected',
            'title' => 'Từ chối lời mời',
            'message' => auth()->user()->username . ' đã từ chối lời mời vào board "' . $board->title . '"',
            'data' => [
                'board_id' => (string) $board->id,
                'board_title' => $board->title,
                'user_id' => (string) auth()->id(),
                'username' => auth()->user()->username
            ],
            'is_read' => false
        ]);

        // Broadcast notification to inviter (real-time)
        try {
            broadcast(new NotificationCreated($notification));
        } catch (\Exception $e) {
            \Log::warning('Failed to broadcast rejection notification: ' . $e->getMessage());
        }

        return response()->json([
            'message' => 'Invitation rejected',
            'invitation' => [
                'id' => (string) $invitation->id,
                'status' => $invitation->status,
            ]
        ]);
    }
}
