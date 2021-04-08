<?php

namespace App\Http\Controllers;

use App\Save;
use App\Game;
use Illuminate\Http\Request;

class SaveController extends Controller
{

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
            'active_player' => $request->active,
            'action' => $request->action,
            'turn' => $request->turn,
            'note' => $request->note,
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

}
