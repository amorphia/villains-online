<?php

namespace App\Console\Commands;

use App\User;
use App\Movie;
use Illuminate\Support\Facades\DB;
use Illuminate\Console\Command;

class DataFiddle extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'fiddle';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Generic command I use as a scratch pad to edit data';

    /**
     * Create a new command instance.
     *
     * @return void
     */
    public function __construct()
    {
        parent::__construct();
    }

    /**
     * Execute the console command.
     *
     * @return mixed
     */
    public function handle()
    {

        $movies = Movie::where('title', 'like', '%Re-release' )->get();

        foreach( $movies as $movie ) {

            $this->line( "Checking {$movie->title}");
            $title = trim( str_ireplace( ['re-release', $movie->year ], '', $movie->title ) );
            $count = Movie::where( 'title', 'like', "{$title}%" )->count();

            if( $count === 1 ){
                $this->info( "Updating to {$title}" );
                $movie->update([ 'title' => $title ]);
            }
        }
    }

}
