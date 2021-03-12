<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class LogController extends Controller
{

    public function show( Request $request, $id = null )
    {
        // abort if we are not an admin
        if( !user()->admin ) return abort( 403 );

        if( $id ){
            // if we are given a file id, but it doesn't exist then 404
            if( !Storage::exists(".forge/daemon-{$id}.log" ) ) return abort( 404 );

            // open specified console log file
            $log = Storage::get(".forge/daemon-{$id}.log");

        } else {
            $log = $this->getMostRecentLog();
        }

        // format log
        $log = $this->formatLog( $log );

        // return the log in plain text
        return response( $log, 200 )->header( 'Content-Type', 'text/plain' );
    }

    protected function getMostRecentLog()
    {

        $logs = array_filter( Storage::files( '.forge' ),
            //only daemon logs
            function ($item) { return strpos( $item, 'daemon-' ); }
        );

        dd( $logs );

    }

    protected function formatLog( $log )
    {
        // trim the whitespace
        $log = trim( $log );

        // explode the log by line
        $log = explode("\n", $log);

        // reverse the log
        $log = array_reverse( $log );

        // get the x most recent items as defined in the config
        $log = array_slice( $log, 0, config( 'app.log_lines_to_display' ) );

        // glue the log back into a string
        $log = implode( "\n", $log );

        return $log;
    }
}
