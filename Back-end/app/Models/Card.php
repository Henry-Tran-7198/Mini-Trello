<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Card extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'board_id',
        'column_id',
        'title',
        'description',
        'cover',
        'orderCard',
        '_destroy'
    ];

    public function members()
    {
        return $this->belongsToMany(User::class, 'card_members');
    }

    public function comments()
    {
        return $this->hasMany(Comment::class);
    }

    public function attachments()
    {
        return $this->hasMany(Attachment::class);
    }
}
