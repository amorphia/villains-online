<?php

/*
 *  Shorthand to return the authenticated user for the current request
 */
if( !function_exists( 'user' ) )
{
    function user()
    {
        return request()->user();
    }
}


/**
 * Recursively search a directories contents and return an array of the file paths found
 *
 * @param string $dir
 * @param array $results
 * @return array
 */
if( !function_exists( 'getDirectoryFileList' ) )
{
    function getDirectoryFileList( string $dir, array &$results = [] ) : array
    {
        $files = scandir( $dir );

        foreach ( $files as $key => $value ) {
            $path = realpath( $dir . DIRECTORY_SEPARATOR . $value );

            if ( !is_dir( $path ) ) {
                $results[] = explode( 'public', $path )[1];
            } else if ( $value != "." && $value != ".." ) {
                getDirectoryFileList( $path, $results );
                $results[] = $path;
            }
        }

        return $results;
    }
}
