<?php
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Models\User;
use Illuminate\Http\Request;
use App\Http\Controllers\Api\BoardController;
use App\Http\Controllers\Api\ColumnController;
use App\Http\Controllers\Api\CardController;
use App\Http\Controllers\Api\Card\AttachmentController;
use App\Http\Controllers\Api\Card\CommentController;
use App\Http\Controllers\Api\Card\CardMemberController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\InvitationController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\EventStreamController;


Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth.token')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::post('/user/avatar', [AuthController::class, 'uploadAvatar']);    
    Route::get('/user', [AuthController::class, 'getCurrentUser']);
    Route::post( '/profile',[AuthController::class, 'updateProfile']);


    // BOARD
    Route::get('/boards', [BoardController::class, 'index']);
    Route::post('/boards', [BoardController::class, 'store']);
    Route::get('/boards/{id}', [BoardController::class, 'show']);
    Route::put('/boards/{id}', [BoardController::class, 'update']);
    Route::delete('/boards/{id}', [BoardController::class, 'destroy']);
    Route::get('/boards/{id}/members', [BoardController::class, 'getMembers']);
    Route::post('/boards/{id}/invite', [BoardController::class, 'inviteMember']);
    Route::delete('/boards/{id}/members/{userId}', [BoardController::class, 'removeMember']);
});
