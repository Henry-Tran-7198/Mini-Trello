<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Notification;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    /**
     * GET /api/notifications - Get all unread notifications for current user
     */
    public function index(Request $request)
    {
        $userId = auth()->id();

        $notifications = Notification::where('user_id', $userId)
            ->where('is_read', false)
            ->orderBy('createdAt', 'desc')
            ->get()
            ->map(function ($notif) {
                return [
                    'id' => (string) $notif->id,
                    'type' => $notif->type,
                    'title' => $notif->title,
                    'message' => $notif->message,
                    'data' => $notif->data,
                    'isRead' => $notif->is_read,
                    'createdAt' => $notif->createdAt,
                ];
            });

        return response()->json([
            'notifications' => $notifications
        ]);
    }

    /**
     * POST /api/notifications/:id/read - Mark notification as read
     */
    public function markAsRead($id)
    {
        $notification = Notification::findOrFail($id);

        // Check if user is the owner of this notification
        if ($notification->user_id !== auth()->id()) {
            return response()->json([
                'message' => 'Unauthorized'
            ], 403);
        }

        $notification->update(['is_read' => true]);

        return response()->json([
            'message' => 'Notification marked as read',
            'notification' => [
                'id' => (string) $notification->id,
                'isRead' => $notification->is_read,
            ]
        ]);
    }

    /**
     * DELETE /api/notifications/:id - Delete notification
     */
    public function destroy($id)
    {
        $notification = Notification::findOrFail($id);

        // Check if user is the owner of this notification
        if ($notification->user_id !== auth()->id()) {
            return response()->json([
                'message' => 'Unauthorized'
            ], 403);
        }

        $notification->delete();

        return response()->json([
            'message' => 'Notification deleted successfully'
        ]);
    }
}
