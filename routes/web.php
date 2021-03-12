<?php

use Illuminate\Support\Facades\Route;
/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/


// Display console log
Route::get('/log/{id?}', 'LogController@show' )->middleware( 'auth' );

// Landing
Route::get('/', 'LandingController@index' )->name( 'landing' );

Auth::routes();
Route::get('logout', 'Auth\LoginController@logout' );

// csrf token
Route::get( '/admin/csrf', 'CsrfController@csrf' )->name( 'csrf' );

// preload image lists
Route::get( '/preload/faction/{faction}', 'PreloadController@faction' );
Route::get( '/preload', 'PreloadController@core' );

// Home
Route::get('/home', 'HomeController@index' )->name('home' );

Route::get( '/game', 'GameController@index' );
Route::post( '/game', 'GameController@store' );
Route::get( '/game/conclude/{game}', 'GameController@conclude' );

Route::get( '/save/{save}', 'SaveController@show' );
Route::post( '/save/{game}', 'SaveController@store' );
