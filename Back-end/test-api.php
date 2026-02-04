<?php
/**
 * Test script để kiểm tra API
 * Chạy: php test-api.php
 */

// Load Laravel
require __DIR__ . '/vendor/autoload.php';
require __DIR__ . '/bootstrap/app.php';

use App\Models\User;
use App\Models\Board;
use App\Models\Column;
use App\Models\Card;

// Tạo user test (nếu chưa có)
$testUser = User::where('email', 'test@example.com')->first();
if (!$testUser) {
    $testUser = User::create([
        'username' => 'testuser',
        'email' => 'test@example.com',
        'password' => bcrypt('password123'),
        'avatar' => 'https://i.pravatar.cc/150?img=1'
    ]);
    echo "✅ Created test user: test@example.com\n";
} else {
    echo "✅ Test user exists: test@example.com\n";
}

// Tạo test board
$testBoard = Board::where('title', 'Test Board')->first();
if (!$testBoard) {
    $testBoard = Board::create([
        'title' => 'Test Board',
        'description' => 'Test description',
        'type' => 'public',
        '_destroy' => false
    ]);

    // Gán user làm owner
    $testBoard->users()->attach($testUser->id, ['role' => 'owner']);
    echo "✅ Created test board: {$testBoard->id}\n";
} else {
    echo "✅ Test board exists: {$testBoard->id}\n";
}

// Tạo test columns
$columns = Column::where('board_id', $testBoard->id)->get();
if ($columns->isEmpty()) {
    $col1 = Column::create([
        'board_id' => $testBoard->id,
        'title' => 'Todo',
        'orderColumn' => 0,
        '_destroy' => false
    ]);

    $col2 = Column::create([
        'board_id' => $testBoard->id,
        'title' => 'In Progress',
        'orderColumn' => 1,
        '_destroy' => false
    ]);

    $col3 = Column::create([
        'board_id' => $testBoard->id,
        'title' => 'Done',
        'orderColumn' => 2,
        '_destroy' => false
    ]);

    echo "✅ Created test columns\n";
} else {
    echo "✅ Test columns exist\n";
    $col1 = $columns[0];
    $col2 = $columns[1] ?? null;
    $col3 = $columns[2] ?? null;
}

// Tạo test cards
if ($col1) {
    $existingCards = Card::where('column_id', $col1->id)->count();
    if ($existingCards === 0) {
        Card::create([
            'board_id' => $testBoard->id,
            'column_id' => $col1->id,
            'title' => 'Sample Card 1',
            'description' => 'This is a test card',
            'cover' => 'https://picsum.photos/200/300?random=1',
            'orderCard' => 0,
            '_destroy' => 0
        ]);

        Card::create([
            'board_id' => $testBoard->id,
            'column_id' => $col1->id,
            'title' => 'Sample Card 2',
            'description' => 'Another test card',
            'cover' => 'https://picsum.photos/200/300?random=2',
            'orderCard' => 1,
            '_destroy' => 0
        ]);

        echo "✅ Created test cards\n";
    } else {
        echo "✅ Test cards exist\n";
    }
}

// Tạo user token
$userToken = $testUser->tokens()->where('token_name', 'api-token')->first();
if (!$userToken) {
    $plainToken = $testUser->createToken('api-token')->plainTextToken;
    echo "✅ Created user token\n";
    echo "\n📋 API Test Token:\n";
    echo "Token: $plainToken\n";
    echo "\n🔗 API Endpoints to test:\n";
    echo "1. GET http://localhost:8000/api/boards\n";
    echo "   Header: Authorization: Bearer $plainToken\n";
    echo "\n2. GET http://localhost:8000/api/boards/{$testBoard->id}\n";
    echo "   Header: Authorization: Bearer $plainToken\n";
} else {
    echo "✅ User token exists\n";
}

echo "\n✅ Test data setup completed!\n";
