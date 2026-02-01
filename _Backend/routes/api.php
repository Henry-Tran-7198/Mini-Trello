<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BoardController;
use App\Http\Controllers\Api\ColumnController;
use App\Http\Controllers\Api\CardController;
use App\Http\Controllers\Api\AttachmentController;
use App\Http\Controllers\Api\CommentController;
use App\Http\Controllers\Api\CardMemberController;


Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth.token')->group(function () {

    // AUTH
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);

    // BOARD
    Route::get('/boards', [BoardController::class, 'index']);
    Route::post('/boards', [BoardController::class, 'store']);
    Route::get('/boards/{id}', [BoardController::class, 'show']);
    Route::put('/boards/{id}', [BoardController::class, 'update']);
    Route::delete('/boards/{id}', [BoardController::class, 'destroy']);

    // COLUMN
    Route::post('/columns', [ColumnController::class, 'store']);
    Route::put('/columns/{id}', [ColumnController::class, 'update']);
    Route::delete('/columns/{id}', [ColumnController::class, 'destroy']);

    // CARD
    Route::post('/cards', [CardController::class, 'store']);
    Route::get('/cards/{id}', [CardController::class, 'show']);
    Route::put('/cards/{id}', [CardController::class, 'update']);
    Route::patch('/cards/{id}/move', [CardController::class, 'move']);
    Route::delete('/cards/{id}', [CardController::class, 'destroy']);

    Route::post('/attachments', [AttachmentController::class, 'store']);
    Route::delete('/attachments/{id}', [AttachmentController::class, 'destroy']);

    Route::post('/comments', [CommentController::class, 'store']);
    Route::delete('/comments/{id}', [CommentController::class, 'destroy']);

    Route::post('/card-members', [CardMemberController::class, 'store']);
    Route::delete('/card-members', [CardMemberController::class, 'destroy']);


});
