<?php
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Models\User;
use Illuminate\Http\Request;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth.token')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::post('/user/avatar', [AuthController::class, 'uploadAvatar']);    
    Route::get('/user', [AuthController::class, 'getCurrentUser']);
    Route::post( '/profile',[AuthController::class, 'updateProfile']);
});
