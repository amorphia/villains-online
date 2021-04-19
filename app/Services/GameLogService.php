<?php


namespace App\Services;


use Illuminate\Support\Facades\Storage;
use phpDocumentor\Reflection\Types\Integer;

class GameLogService
{

    /**
     * Returns our log text
     * @param  $id
     * @return string
     */
    public function getLogFromId( int $id ) : string
    {
        // if we are given a file id, but it doesn't exist then 404
        if( !Storage::exists(".forge/daemon-{$id}.log" ) ) return false;

        // open specified console log file
        $log = Storage::get(".forge/daemon-{$id}.log");

        // format log
        $log = $this->formatLog( $log );

        return $log;
    }


    /**
     * Format our log text
     * @param $log
     * @return array|string
     */
    protected function formatLog( string $log ) : string
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
