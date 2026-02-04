<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Invitation extends Model
{
    protected $fillable = [
        'inviter_id',
        'invitee_id',
        'board_id',
        'type',
        'status',
        '_destroy'
    ];

    public $timestamps = true;
    const CREATED_AT = 'createdAt';
    const UPDATED_AT = 'updatedAt';

    // Relationships
    public function inviter()
    {
        return $this->belongsTo(User::class, 'inviter_id');
    }

    public function invitee()
    {
        return $this->belongsTo(User::class, 'invitee_id');
    }

    public function board()
    {
        return $this->belongsTo(Board::class);
    }
}