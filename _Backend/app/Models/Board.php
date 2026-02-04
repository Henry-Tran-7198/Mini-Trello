<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Board extends Model
{
    protected $table = 'boards';
    public $timestamps = false;

    protected $fillable = [
        'title',
        'description',
        'type',
        '_destroy'
    ];

    public function columns()
    {
        return $this->hasMany(Column::class)->orderBy('orderColumn');
    }

    public function users()
    {
        return $this->belongsToMany(User::class, 'board_users')
            ->withPivot('role');
    }
}
