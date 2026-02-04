<?php
require 'vendor/autoload.php';
$app = require 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\User;

$user = User::find(1);
$token = $user->createToken('test-token')->plainTextToken;

echo "✅ Token created for user: {$user->username}\n";
echo "Token: {$token}\n";
echo "User ID: {$user->id}\n";
echo "Email: {$user->email}\n";
