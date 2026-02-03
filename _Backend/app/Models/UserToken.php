<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UserToken extends Model
{
    protected $table = 'user_tokens';

    public $timestamps = false;

    protected $fillable = [
        'user_id',
        'token',
        'created_at'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
