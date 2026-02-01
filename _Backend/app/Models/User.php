<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use App\Traits\HasCustomTokens;

class User extends Authenticatable
{
    use HasCustomTokens;

    protected $fillable = [
        'email',
        'username',
        'password',
        'avatar',
        'role',
        'isActive',
    ];

    public $timestamps = true;

    const CREATED_AT = 'createdAt';
    const UPDATED_AT = 'updatedAt';

    protected $hidden = ['password'];
}
