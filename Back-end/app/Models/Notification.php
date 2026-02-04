<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Notification extends Model
{
    protected $fillable = [
        'user_id',
        'type',
        'title',
        'message',
        'data',
        'is_read',
        '_destroy'
    ];

    protected $casts = [
        'data' => 'json',
        'is_read' => 'boolean',
        '_destroy' => 'boolean'
    ];

    public $timestamps = true;
    const CREATED_AT = 'createdAt';
    const UPDATED_AT = 'updatedAt';

    // Relationships
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}