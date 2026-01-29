<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\UserToken;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage;
use App\Http\Requests\ProfileRequest;
use Illuminate\Support\Facades\Log;

class AuthController extends Controller
{
    // REGISTER
    public function register(Request $request)
    {
        $request->validate([
            'email'    => 'required|email|unique:users',
            'username' => 'required|min:3|unique:users',
            'password' => 'required|min:6|confirmed',
            'avatar'   => 'nullable|image|max:2048'
        ]);

        $avatar = $request->hasFile('avatar')
            ? $request->file('avatar')->store('avatars', 'public')
            : 'avatars/default.png';

        $user = User::create([
            'email'    => $request->email,
            'username' => $request->username,
            'password' => Hash::make($request->password),
            'avatar'   => $avatar,
            'role'     => 'client',
            'isActive' => 1
        ]);

        return response()->json(['message' => 'Register success'], 201);
    }

    // LOGIN
    public function login(Request $request)
    {
        $request->validate([
            'login'    => 'required',
            'password' => 'required'
        ]);

        $user = User::where('email', $request->login)
            ->orWhere('username', $request->login)
            ->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json(['message' => 'Invalid credentials'], 401);
        }

        if (!$user->isActive) {
            return response()->json(['message' => 'Account inactive'], 403);
        }

        $token = hash('sha256', Str::random(60));

        UserToken::create([
            'user_id' => $user->id,
            'token'   => $token
        ]);

        return response()->json([
            'token' => $token,
            'user'  => [
                'id'       => $user->id,
                'email'    => $user->email,
                'username' => $user->username,
                'avatar' => $user->avatar ? asset('storage/' . $user->avatar) : asset('storage/avatars/default.png'),
            ]
        ]);
    }

    // LOGOUT
    public function logout(Request $request)
    {
        $auth = $request->header('Authorization');
        $token = substr($auth, 7);

        \App\Models\UserToken::where('token', $token)->delete();

        return response()->json([
            'message' => 'Logged out'
        ]);
    }

    
    //UPLOAD AVATAR (login required)
    public function uploadAvatar(Request $request)
    {
        $request->validate([
            'avatar' => 'required|image|mimes:jpg,jpeg,png,webp|max:2048',
        ]);

        $user = $request->attributes->get('auth_user');

        if (!$user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }
        
        // xoá avatar cũ (trừ default)
        if ($user->avatar && $user->avatar !== 'avatars/default.png') {
            Storage::disk('public')->delete($user->avatar);
        }

        $path = $request->file('avatar')->store('avatars', 'public');

        $user->avatar = $path;
        $user->save();

        return response()->json([
            'message'    => 'Avatar updated',
            'avatar_url' => asset('storage/' . $path),
        ]);
    }

    // GET CURRENT USER
    public function getCurrentUser(Request $request)
    {
        $user = $request->attributes->get('auth_user');

        if(!$user){
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        return response()->json([
            'success' => true,
            'message' => 'Get User successfully!!!',
            'data' => [
                'id' => $user->id,
                'email' => $user->email,
                'username' => $user->username,
                'password' => $user->password,
                'avatar' => $user->avatar ? 
                asset('storage/' . $user->avatar) : 
                asset('storage/avatars/default.png'),
            ]
        ]);
    }

    // UPDATE PROFILE
    public function updateProfile(Request $request)
    {
        $user = $request->attributes->get('auth_user');

        if (!$user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        try {
            Log::info('Request data received:', $request->all());
            $validated = $request->validate([
                'email'    => ['nullable', 'email', 'unique:users,email,' . $user->id],
                'username' => ['nullable', 'min:3', 'unique:users,username,' . $user->id],
                'password' => ['nullable', 'min:6', 'confirmed'],
                'avatar'   => ['nullable', 'image', 'max:2048'],
            ]);

            // Only fill validated fields (safe & clean)
            $user->fill($validated);
            Log::info('Validated data:', $validated);

            // Handle file separately (not in validation array)
            if ($request->hasFile('avatar')) {
                if ($user->avatar && $user->avatar !== 'avatar/default.png') {
                    Storage::disk('public')->delete($user->avatar);
                }
                $path = $request->file('avatar')->store('avatars', 'public');
                $user->avatar = $path;
            }
            Log::info('User before save:', $user->toArray());
            Log::info('All request:', $request->all());
            Log::info('Files:', $request->file());

            $user->save();
            Log::info('User after save:', $user->toArray());

            return response()->json([
                'success' => true,
                'message' => 'Update successfully!!!',
                'data' => [
                    'id' => $user->id,
                    'email' => $user->email,
                    'username' => $user->username,
                    'avatar' => asset('storage/' . $user->avatar)
                ]
            ], 200);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Dữ liệu không hợp lệ',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            Log::error('Update Profile failed', [
                'message' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'request' => $request->all(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Update failed: ' . $e->getMessage(),
            ], 500);
        }
    }
}
