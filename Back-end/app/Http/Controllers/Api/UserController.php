<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class UserController extends Controller
{
    /**
     * SEARCH USERS by username or email
     */
    public function search(Request $request)
    {
        $query = $request->query('q');

        if (!$query || strlen($query) < 1) {
            return response()->json([
                'users' => []
            ]);
        }

        $users = User::where('username', 'like', "%{$query}%")
            ->orWhere('email', 'like', "%{$query}%")
            ->limit(10)
            ->get();

        $result = [];
        foreach ($users as $user) {
            $result[] = [
                'id' => (string) $user->id,
                'username' => $user->username,
                'email' => $user->email,
                'avatar' => $user->avatar
            ];
        }

        return response()->json([
            'users' => $result
        ]);
    }

    /**
     * GET USER BY ID
     */
    public function show($id)
    {
        $user = User::findOrFail($id);

        return response()->json([
            'user' => [
                'id' => (string) $user->id,
                'username' => $user->username,
                'email' => $user->email,
                'avatar' => $user->avatar
            ]
        ]);
    }

    /**
     * UPDATE NOTIFICATION PREFERENCES
     */
    public function updateNotificationPreferences(Request $request)
    {
        $user = Auth::user();

        $request->validate([
            'boardUpdates' => 'boolean',
            'cardAssignment' => 'boolean',
            'cardComments' => 'boolean',
            'cardMove' => 'boolean',
            'cardAttachment' => 'boolean',
            'emailNotifications' => 'boolean',
        ]);

        $preferences = [
            'boardUpdates' => $request->boolean('boardUpdates'),
            'cardAssignment' => $request->boolean('cardAssignment'),
            'cardComments' => $request->boolean('cardComments'),
            'cardMove' => $request->boolean('cardMove'),
            'cardAttachment' => $request->boolean('cardAttachment'),
            'emailNotifications' => $request->boolean('emailNotifications'),
        ];

        $user->notification_preferences = $preferences;
        $user->save();

        return response()->json([
            'message' => 'Notification preferences updated successfully',
            'notification_preferences' => $preferences
        ]);
    }

    /**
     * GET NOTIFICATION PREFERENCES
     */
    public function getNotificationPreferences()
    {
        $user = Auth::user();

        return response()->json([
            'notification_preferences' => $user->notification_preferences ?? [
                'boardUpdates' => true,
                'cardAssignment' => true,
                'cardComments' => true,
                'cardMove' => true,
                'cardAttachment' => true,
                'emailNotifications' => true,
            ]
        ]);
    }
}
