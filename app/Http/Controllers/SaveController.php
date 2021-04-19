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
     * @param string game
     * @return \Illuminate\Http\Response
     */
    public function store( Request $request, string $game )
    {
        // get our game
        $game = Game::where( 'uuid', $game )->firstOrFail();

        // validate our data
        $validated = $request->validate([
                'type' => ['required', 'string'],
                'active_player' => ['nullable', 'string'],
                'action' => ['required','integer'],
                'turn' => ['required','integer'],
                'note' => ['nullable', 'string'],
                'data' => ['required', 'json']
            ]);

        // create a save state for it
        $game->saves()->create( $validated );

        // delete our old save if needed
        $game->deleteOldSave();
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
