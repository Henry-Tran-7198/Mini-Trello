<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Storage;

Route::get('/storage/avatars/{filename}', function ($filename) {
    $path = 'avatars/' . $filename;

    if (!Storage::disk('public')->exists($path)) {
        return response('File not found', 404);
    }

    $file = storage_path('app/public/avatars/' . $path);
    $stream = fopen($file, 'r');

    return response()->stream(function () use ($stream) {
        fpassthru($stream);
    }, 200, [
        'Content-Type' => 'image/jpeg',
        'Cache-Control' => 'public, max-age=3600'
    ]);
})->name('avatar');

Route::get('/', function () {
    return view('welcome');
});