<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class PreloadController extends Controller
{
    function faction( $faction ){
        $files =  $this->getDirContents( $_SERVER['DOCUMENT_ROOT'] . '/images/factions/' . $faction );
        return response()->json( $files );
    }

    function core( ){
        $files = [];
        foreach( config('app.core_file_folders') as $folder ){
            $files = array_merge( $files, $this->getDirContents( $_SERVER['DOCUMENT_ROOT'] . $folder ) );
        }

        return response()->json( $files );
    }

    function getDirContents( $dir, &$results = [] ) {
        $files = scandir( $dir );

        foreach ( $files as $key => $value ) {
            $path = realpath($dir . DIRECTORY_SEPARATOR . $value );
            if ( !is_dir( $path ) ) {
                $results[] = explode( 'public', $path )[1];
            } else if ( $value != "." && $value != ".." ) {
                $this->getDirContents( $path, $results );
                $results[] = $path;
            }
        }

        return $results;
    }

}
