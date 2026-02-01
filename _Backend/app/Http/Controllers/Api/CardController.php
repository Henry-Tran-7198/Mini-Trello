<?php

// namespace App\Http\Controllers\Api;

// use App\Http\Controllers\Controller;
// use App\Models\Card;
// use App\Models\Column;
// use Illuminate\Http\Request;

// class CardController extends Controller
// {
//     /**
//      * Create new card
//      */
//     public function store(Request $request)
//     {
//         $request->validate([
//             'boardId'  => 'required|exists:boards,id',
//             'columnId' => 'required|exists:columns,id',
//             'title'    => 'required|string|max:255',
//             'cover'    => 'nullable|string',
//             'description' => 'nullable|string'
//         ]);

//         // kiểm tra column thuộc board
//         $column = Column::where('id', $request->columnId)
//             ->where('board_id', $request->boardId)
//             ->first();

//         if (!$column) {
//             return response()->json([
//                 'message' => 'Column does not belong to this board'
//             ], 422);
//         }

//         // lấy orderCard cuối cùng
//         $maxOrder = Card::where('column_id', $column->id)->max('orderCard') ?? 0;

//         $card = Card::create([
//             'board_id'   => $request->boardId,
//             'column_id'  => $request->columnId,
//             'title'      => $request->title,
//             'description'=> $request->description,
//             'cover'      => $request->cover,
//             'orderCard'  => $maxOrder + 1,
//             '_destroy'   => 0
//         ]);

//         return response()->json([
//             'message' => 'Card created',
//             'card' => [
//                 '_id' => (string)$card->id,
//                 'boardId' => (string)$card->board_id,
//                 'columnId' => (string)$card->column_id,
//                 'title' => $card->title,
//                 'description' => $card->description,
//                 'cover' => $card->cover,
//                 'memberIds' => [],
//                 'comments' => [],
//                 'attachments' => []
//             ]
//         ], 201);
//     }

//     /**
//      * Update card (title, description, cover)
//      */
//     public function update(Request $request, $id)
//     {
//         $card = Card::findOrFail($id);

//         $request->validate([
//             'title' => 'sometimes|required|string|max:255',
//             'description' => 'nullable|string',
//             'cover' => 'nullable|string'
//         ]);

//         $card->update($request->only([
//             'title',
//             'description',
//             'cover'
//         ]));

//         return response()->json([
//             'message' => 'Card updated',
//             'card' => $card
//         ]);
//     }

//     /**
//      * Move card (drag & drop)
//      */
//     public function move(Request $request, $id)
//     {
//         $request->validate([
//             'toColumnId' => 'required|exists:columns,id',
//             'orderCard'  => 'required|integer'
//         ]);

//         $card = Card::findOrFail($id);

//         $card->update([
//             'column_id' => $request->toColumnId,
//             'orderCard' => $request->orderCard
//         ]);

//         return response()->json([
//             'message' => 'Card moved'
//         ]);
//     }

//     /**
//      * Soft delete card
//      */
//     public function destroy($id)
//     {
//         $card = Card::findOrFail($id);
//         $card->_destroy = 1;
//         $card->save();

//         return response()->json([
//             'message' => 'Card removed'
//         ]);
//     }
// }


namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Column;
use App\Models\Card;
use Illuminate\Http\Request;

class CardController extends Controller
{
    // CREATE CARD
    public function store(Request $request)
    {
        $request->validate([
            'boardId'  => 'required|exists:boards,id',
            'columnId' => 'required|exists:columns,id',
            'title'    => 'required|string|max:255',
            'cover'    => 'nullable|string',
            'description' => 'nullable|string'
        ]);

        $column = Column::where('id', $request->columnId)
            ->where('board_id', $request->boardId)
            ->first();

        if (!$column) {
            return response()->json([
                'message' => 'Column does not belong to this board'
            ], 422);
        }

        $maxOrder = Card::where('column_id', $column->id)->max('orderCard') ?? 0;

        $card = Card::create([
            'board_id'   => $request->boardId,
            'column_id'  => $request->columnId,
            'title'      => $request->title,
            'description'=> $request->description ?? null,
            'cover'      => $request->cover ?? null,
            'orderCard'  => $maxOrder + 1,
            '_destroy'   => 0
        ]);

        return response()->json([
            'message' => 'Card created',
            'card' => [
                '_id' => (string)$card->id,
                'boardId' => (string)$card->board_id,
                'columnId' => (string)$card->column_id,
                'title' => $card->title,
                'description' => $card->description,
                'cover' => $card->cover,
                'memberIds' => [],
                'comments' => [],
                'attachments' => []
            ]
        ], 201);
    }


    // CARD DETAIL (modal)
    public function show($id)
    {
        return Card::with([
            'members:id,username,email,avatar',
            'comments.user:id,username,avatar',
            'attachments'
        ])->findOrFail($id);
    }

    /**
     * UPDATE CARD (title, description, cover)
     */
    public function update(Request $request, $id)
    {
        $card = Card::findOrFail($id);

        $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'cover' => 'nullable|string'
        ]);

        $card->update($request->only([
            'title',
            'description',
            'cover'
        ]));

        return response()->json([
            'message' => 'Card updated successfully',
            'card' => [
                '_id' => (string) $card->id,
                'boardId' => (string) $card->board_id,
                'columnId' => (string) $card->column_id,
                'title' => $card->title,
                'description' => $card->description,
                'cover' => $card->cover
            ]
        ]);
    }

    /**
     * MOVE CARD (drag & drop)
     */
    public function move(Request $request, $id)
    {
        $card = Card::findOrFail($id);

        $request->validate([
            'toColumnId' => 'required|exists:columns,id',
            'orderCard'  => 'required|integer'
        ]);

        $card->update([
            'column_id' => $request->toColumnId,
            'orderCard' => $request->orderCard
        ]);

        return response()->json([
            'message' => 'Card moved successfully'
        ]);
    }

    /**
     * DELETE CARD (soft delete)
     */
    public function destroy($id)
    {
        $card = Card::findOrFail($id);

        $card->_destroy = 1;
        $card->save();

        return response()->json([
            'message' => 'Card deleted successfully'
        ]);
    }
}
