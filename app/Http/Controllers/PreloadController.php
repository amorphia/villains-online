<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class PreloadController extends Controller
{

    /**
     * Return an array of all of the image file paths for a given faction
     *
     * @param string $faction
     * @return \Illuminate\Http\JsonResponse
     */
    public function faction( string $faction )
    {
        $files = getDirectoryFileList( $_SERVER['DOCUMENT_ROOT'] . '/images/factions/' . $faction );
        return response()->json( $files );
    }


    /**
     * Return an array all of our core image resource paths
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function core()
    {
        $files = [];

        foreach( config('app.core_image_folders') as $folder ){
            $files = array_merge( $files, getDirectoryFileList( $_SERVER['DOCUMENT_ROOT'] . $folder ) );
        }

        return response()->json( $files );
    }

}
