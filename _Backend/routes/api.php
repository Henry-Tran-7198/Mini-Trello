<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BoardController;
use App\Http\Controllers\Api\ColumnController;
use App\Http\Controllers\Api\CardController;
use App\Http\Controllers\Api\AttachmentController;
use App\Http\Controllers\Api\CommentController;
use App\Http\Controllers\Api\CardMemberController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\InvitationController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\EventStreamController;


Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// REAL-TIME EVENTS (Server-Sent Events) - No middleware, auth handled in controller
Route::get('/events/stream', [EventStreamController::class, 'stream']);

Route::middleware('auth.token')->group(function () {

    // AUTH
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);

    // USER
    Route::get('/users/search', [UserController::class, 'search']);
    Route::get('/users/{id}', [UserController::class, 'show']);

    // BOARD
    Route::get('/boards', [BoardController::class, 'index']);
    Route::post('/boards', [BoardController::class, 'store']);
    Route::get('/boards/{id}', [BoardController::class, 'show']);
    Route::put('/boards/{id}', [BoardController::class, 'update']);
    Route::delete('/boards/{id}', [BoardController::class, 'destroy']);
    Route::get('/boards/{id}/members', [BoardController::class, 'getMembers']);
    Route::post('/boards/{id}/invite', [BoardController::class, 'inviteMember']);
    Route::delete('/boards/{id}/members/{userId}', [BoardController::class, 'removeMember']);

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

    // INVITATIONS
    Route::get('/invitations', [InvitationController::class, 'index']);
    Route::post('/invitations/{id}/accept', [InvitationController::class, 'accept']);
    Route::post('/invitations/{id}/reject', [InvitationController::class, 'reject']);

    // NOTIFICATIONS
    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::post('/notifications/{id}/read', [NotificationController::class, 'markAsRead']);
    Route::delete('/notifications/{id}', [NotificationController::class, 'destroy']);

});
