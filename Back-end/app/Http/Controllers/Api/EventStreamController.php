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

        // Set up streaming response
        return response()->stream(function () use ($user) {
            // Send initial heartbeat
            echo ": heartbeat\n\n";
            flush();

            // Keep connection alive with periodic heartbeats
            $startTime = time();
            $maxDuration = 300; // 5 minutes max

            while ((time() - $startTime) < $maxDuration) {
                // Check for new notifications
                $notifications = $user->notifications()
                    ->where('is_read', false)
                    ->orderBy('created_at', 'desc')
                    ->limit(10)
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
                                'createdAt' => $notification->created_at
                            ]
                        ]) . "\n\n";
                        flush();

                        // Mark as read after sending
                        $notification->update(['is_read' => true]);
                    }
                }

                // Send heartbeat every 3 seconds to keep connection alive
                echo ": heartbeat\n\n";
                flush();
                sleep(3);
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
