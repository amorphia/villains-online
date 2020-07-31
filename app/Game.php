<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Game extends Model
{

    protected $guarded = [];

    public function players()
    {
        return $this->belongsToMany( User::class );
    }

    public function saves()
    {
        return $this->hasMany( Save::class );
    }

    public function turns()
    {
        return $this->getSaveByType( 'turn' );
    }

    public function manuals()
    {
        return $this->getSaveByType( 'manual' );
    }

    public function automatics()
    {
        return $this->getSaveByType( 'automatic' )
                    ->take( 5 );
    }

    public function getSaveByType( $type )
    {
        return $this->saves()
            ->select( 'id', 'type', 'created_at' )
            ->where( 'type', $type )
            ->orderByDesc( 'created_at' );
    }

}
