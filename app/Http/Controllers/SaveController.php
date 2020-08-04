<?php

namespace App\Http\Controllers;

use App\Save;
use App\Game;
use Illuminate\Http\Request;

class SaveController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        //
    }

    /**
     * Show the form for creating a new resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store( Request $request, $game )
    {
        $game = Game::where( 'uuid', $game )->first();

        $game->saves()->create([
            'type' => $request->type,
            'data' => $request->data
        ]);

        // delete oldest save if we've hit max saves
        $saves = $game->saves()->where('type', 'automatic')->orderBy( 'created_at' )->get();
        if( $saves->count() > config( 'app.max_saves') ){
            $saves->first()->delete();
        }
    }

    /**
     * Display the specified resource.
     *
     * @param  \App\Save  $save
     * @return \Illuminate\Http\Response
     */
    public function show( Save $save )
    {
        return $save->data;
    }

    /**
     * Show the form for editing the specified resource.
     *
     * @param  \App\Save  $save
     * @return \Illuminate\Http\Response
     */
    public function edit(Save $save)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Save  $save
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, Save $save)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  \App\Save  $save
     * @return \Illuminate\Http\Response
     */
    public function destroy(Save $save)
    {
        //
    }
}
