<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use App\Models\UserToken;

class AuthToken
{
    public function handle(Request $request, Closure $next)
    {
        $auth = $request->header('Authorization');

        if (!$auth || !str_starts_with($auth, 'Bearer ')) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        $token = substr($auth, 7);

        $userToken = UserToken::with('user')
            ->where('token', $token)
            ->first();

        if (!$userToken || !$userToken->user) {
            return response()->json(['message' => 'Invalid token'], 401);
        }

        // ✅ GẮN USER VÀO REQUEST
        $request->attributes->set('auth_user', $userToken->user);

        // (optional)
        auth()->login($userToken->user);

        return $next($request);
    }
}
