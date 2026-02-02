<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\UserToken;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class EventStreamController extends Controller
{
    /**
     * Server-Sent Events stream for real-time notifications
     */
    public function stream(Request $request)
    {
        // Get token from Authorization header or query parameter
        $token = null;
        $authHeader = $request->header('Authorization');
        
        if ($authHeader && str_starts_with($authHeader, 'Bearer ')) {
            $token = substr($authHeader, 7);
        } elseif ($request->query('token')) {
            $token = $request->query('token');
        }

        if (!$token) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        // Find user by token
        $userToken = UserToken::where('token', $token)->first();
        if (!$userToken) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        $user = $userToken->user;
        if (!$user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        return response()->stream(function () use ($user) {
            // Keep the connection alive
            while (true) {
                // Check for new notifications
                $notifications = $user->notifications()
                    ->where('is_read', false)
                    ->orderBy('createdAt', 'desc')
                    ->get();

                if ($notifications->count() > 0) {
                    foreach ($notifications as $notification) {
                        echo "data: " . json_encode([
                            'type' => 'notification',
                            'notification' => [
                                'id' => (string) $notification->id,
                                'type' => $notification->type,
                                'title' => $notification->title,
                                'message' => $notification->message,
                                'data' => $notification->data,
                                'createdAt' => $notification->createdAt
                            ]
                        ]) . "\n\n";

                        // Mark as read after sending
                        $notification->update(['is_read' => true]);
                    }
                }

                // Send heartbeat every 5 seconds
                echo ": heartbeat\n\n";
                flush();
                sleep(5);
            }
        }, 200, [
            'Content-Type' => 'text/event-stream',
            'Cache-Control' => 'no-cache',
            'Connection' => 'keep-alive',
            'Access-Control-Allow-Origin' => '*',
            'Access-Control-Allow-Headers' => 'Content-Type, Authorization',
        ]);
    }
}
