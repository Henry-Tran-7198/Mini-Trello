<?php

namespace App\Traits;

use App\Models\UserToken;
use Illuminate\Support\Str;

trait HasCustomTokens
{
    public function createToken($name = 'API Token')
    {
        $token = \Illuminate\Support\Str::random(80);

        $this->tokens()->create([
            'token' => $token,
            'created_at' => now()
        ]);

        $response = new \stdClass();
        $response->plainTextToken = $token;
        $response->token = $token;

        return $response;
    }

    public function tokens()
    {
        return $this->hasMany(UserToken::class);
    }

    public function getTokenAttribute()
    {
        return $this->tokens()->latest('created_at')->first()?->token;
    }
}
