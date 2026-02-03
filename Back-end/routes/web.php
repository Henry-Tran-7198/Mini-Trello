<?php

// use GuzzleHttp\Psr7\Request;

use App\Http\Controllers\TestController;
use Illuminate\Support\Facades\Route;
use Illuminate\Http\Request;

Route::get('/', function () {
    return view('welcome');
});

