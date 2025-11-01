<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

Route::view('/admin/{view?}', 'admin')
    ->where('view', '.*')
    ->name('admin.spa');
