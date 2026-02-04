<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Column extends Model
{
    protected $table = 'columns';

    public $timestamps = false;

    protected $fillable = [
        'board_id',
        'title',
        'orderColumn',
        '_destroy'
    ];

    public function board()
    {
        return $this->belongsTo(Board::class);
    }

    // public function cards()
    // {
    //     return $this->hasMany(Card::class);
    // }
}