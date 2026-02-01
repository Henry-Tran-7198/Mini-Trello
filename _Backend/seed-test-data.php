<?php
require 'vendor/autoload.php';
$app = require 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\User;
use App\Models\Board;
use App\Models\Column;
use App\Models\Card;
use Illuminate\Support\Facades\DB;

// Disable foreign key constraints
DB::statement('SET FOREIGN_KEY_CHECKS=0');

// Clear existing data
Card::truncate();
Column::truncate();
Board::truncate();
User::truncate();

// Re-enable foreign key constraints
DB::statement('SET FOREIGN_KEY_CHECKS=1');

// Create test user
$user = User::create([
    'username' => 'testuser',
    'email' => 'test@example.com',
    'password' => bcrypt('password123'),
    'avatar' => 'https://i.pravatar.cc/150?img=1',
    'isActive' => true
]);

echo "✅ Created user: {$user->username} (ID: {$user->id})\n";

// Create test board
$board = Board::create([
    'title' => 'Demo Board',
    'description' => 'This is a demo Trello board',
    'type' => 'public',
    '_destroy' => false
]);

echo "✅ Created board: {$board->title} (ID: {$board->_id})\n";

// Attach user to board as owner
$board->users()->attach($user->id, ['role' => 'owner']);
echo "✅ Attached user to board as owner\n";

// Create test columns
$columns = [];
$columnTitles = ['To Do', 'In Progress', 'Done'];
foreach ($columnTitles as $index => $title) {
    $column = Column::create([
        'board_id' => $board->id,
        'title' => $title,
        'orderColumn' => $index,
        '_destroy' => false
    ]);
    $columns[] = $column;
    echo "✅ Created column: {$title} (ID: {$column->id})\n";
}

// Create test cards
$cardTitles = [
    ['To Do', ['Design homepage', 'Create database schema', 'Setup backend']],
    ['In Progress', ['Implement auth', 'Build API endpoints']],
    ['Done', ['Setup project', 'Install dependencies']]
];

foreach ($cardTitles as [$columnTitle, $titles]) {
    $column = collect($columns)->firstWhere('title', $columnTitle);
    foreach ($titles as $cardIndex => $cardTitle) {
        $card = Card::create([
            'board_id' => $board->id,
            'column_id' => $column->id,
            'title' => $cardTitle,
            'description' => "This is a test card for {$cardTitle}",
            'cover' => '',
            'orderCard' => $cardIndex,
            '_destroy' => false
        ]);
        echo "  ✅ Created card: {$cardTitle}\n";
    }
}


echo "\n✅ Test data seeded successfully!\n";
echo "User ID: {$user->id}\n";
echo "Board ID: {$board->id}\n";
