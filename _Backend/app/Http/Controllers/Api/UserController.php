<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;

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
}
