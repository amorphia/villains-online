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


// Landing
Route::view('/', 'welcome' )
    ->middleware('guest')
    ->name( 'landing' );

// Authentication
Auth::routes();
Route::get('logout', 'Auth\LoginController@logout' );


// csrf token
Route::get( '/admin/csrf', 'CsrfController@csrf' )
    ->name( 'csrf' );


// preload image lists
Route::get( '/preload/faction/{faction}', 'PreloadController@faction' );
Route::get( '/preload', 'PreloadController@core' );


// Home
Route::view('/home', 'home' )
    ->middleware( 'auth' )
    ->name('home' );


// Game data
Route::get( '/game', 'GameController@index' );
Route::post( '/game', 'GameController@store' );
Route::get( '/game/conclude/{game}', 'GameController@conclude' );


// Saves
Route::get( '/save/{save}', 'SaveController@show' );
Route::post( '/save/{game}', 'SaveController@store' );


// View game server log
Route::get('/log/{id?}', 'LogController@show' )
    ->middleware( 'auth' );
