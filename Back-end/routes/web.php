<?php

// use GuzzleHttp\Psr7\Request;

use App\Http\Controllers\TestController;
use Illuminate\Support\Facades\Route;
use Illuminate\Http\Request;

Route::get('/', function () {
    return view('welcome');
});

// Route::get('/tester-laravel1',  [TestController::class, 'test01']);
// Route::get('/tester-laravel2',  [TestController::class, 'test02']);
// Route::get('/tester-laravel3',  [TestController::class, 'test03']);

// Create group the same controller
Route::controller(TestController::class)->group(function(){
    Route::get('/tester-laravel1','test01');
    Route::get('/tester-laravel2','test02');
    Route::get('/tester-laravel3','test03');
});

// Tiền tố prefix
// Route::prefix('admin')->name('admin.')->group(function () {
//     Route::get('/account', function () {
//         return 'Route account - admin!!!';
//     });
//     Route::get('/dashboard', function () {
//         return 'Route dashboard - admin!!!';
//     });
// });
// http://127.0.0.1:8000/admin/account
// http://127.0.0.1:8000/admin/dashboard

// Route::get('/netflix', function () {
//     return view('netflix');
// });

Route::get('/netflix', action: [TestController::class, 'test02']);
Route::post('/netflix', action: [TestController::class, 'test01']);

// Route::post('/netflix', function () {
//     return view('firm');
// })->name('post-firm');

// Route::get('/account', function () {
//     session(['name' => 'Oliver Queen']);
//     return 'Current account: ' . session('name'); 
// });

// Route::put('/account', function (Request $request) {
//     $newName = $request->input('firm');
//     session(['name' => $newName]);
//     return 'Update account: ' . session('name'); 
// })->name('name-update');
