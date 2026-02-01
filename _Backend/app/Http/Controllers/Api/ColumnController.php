<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Column;
use App\Models\Board;

class ColumnController extends Controller
{
    /**
     * CREATE COLUMN
     */
    public function store(Request $request)
    {
        $request->validate([
            'boardId' => 'required|exists:boards,id',
            'title' => 'required|string|max:255'
        ]);

        // Tính orderColumn tiếp theo
        $maxOrder = Column::where('board_id', $request->boardId)->max('orderColumn');
        $nextOrder = is_null($maxOrder) ? 0 : $maxOrder + 1;

        $column = Column::create([
            'board_id' => $request->boardId,
            'title' => $request->title,
            'orderColumn' => $nextOrder,
            '_destroy' => false
        ]);

        // FE yêu cầu placeholder card nếu column rỗng
        $placeholderCardId = 'column-' . $column->id . '-placeholder-card';

        return response()->json([
            '_id' => (string) $column->id,
            'boardId' => (string) $column->board_id,
            'title' => $column->title,
            'cardOrderIds' => [$placeholderCardId],
            'cards' => [
                [
                    '_id' => $placeholderCardId,
                    'boardId' => (string) $column->board_id,
                    'columnId' => (string) $column->id,
                    'FE_PlaceholderCard' => true
                ]
            ]
        ], 201);
    }

    /**
     * UPDATE COLUMN (title)
     */
    public function update(Request $request, $id)
    {
        $column = Column::findOrFail($id);

        $request->validate([
            'title' => 'sometimes|required|string|max:255'
        ]);

        $column->update($request->only([
            'title'
        ]));

        return response()->json([
            'message' => 'Column updated successfully',
            'column' => [
                '_id' => (string) $column->id,
                'boardId' => (string) $column->board_id,
                'title' => $column->title
            ]
        ]);
    }

    /**
     * DELETE COLUMN (soft delete)
     */
    public function destroy($id)
    {
        $column = Column::findOrFail($id);

        $column->_destroy = 1;
        $column->save();

        return response()->json([
            'message' => 'Column deleted successfully'
        ]);
    }
}
