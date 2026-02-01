<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Comment;
use Illuminate\Http\Request;

class CommentController extends Controller
{
    public function store(Request $request)
    {
        $data = $request->validate([
            'card_id' => 'required|exists:cards,id',
            'user_id' => 'required|exists:users,id',
            'content' => 'required|string'
        ]);

        return Comment::create($data);
    }

    public function destroy($id)
    {
        Comment::findOrFail($id)->delete();
        return response()->json(['message' => 'Comment deleted']);
    }
}
