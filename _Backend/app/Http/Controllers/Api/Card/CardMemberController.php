<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class CardMemberController extends Controller
{
    public function store(Request $request)
    {
        $data = $request->validate([
            'card_id' => 'required|exists:cards,id',
            'user_id' => 'required|exists:users,id'
        ]);

        DB::table('card_members')->insert($data);

        return response()->json(['message' => 'Member added']);
    }

    public function destroy(Request $request)
    {
        DB::table('card_members')
            ->where('card_id', $request->card_id)
            ->where('user_id', $request->user_id)
            ->delete();

        return response()->json(['message' => 'Member removed']);
    }
}
