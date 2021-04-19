<?php

namespace App\Http\Controllers;

use App\Services\GameLogService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class LogController extends Controller
{

    /**
     * @var GameLogService
     */
    protected $gameLogService;


    public function __construct( GameLogService $gameLogService )
    {
        $this->gameLogService = $gameLogService;
    }


    /**
     * Returns the specified log text
     *
     * @param Request $request
     * @param null $id // optional log ID to fetch
     * @return \Illuminate\Http\Response
     */
    public function show( Request $request, $id = null )
    {
        // abort if we are not an admin
        if( !user()->admin ) return abort( 403 );

        // get our log
        $log = $this->gameLogService->getLogFromId( $id );

        // if we don't have a log, abort
        if( !$log ) return abort( 404 );

        // return the log in plain text
        return response( $log, 200 )->header( 'Content-Type', 'text/plain' );
    }


}
