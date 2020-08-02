<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Game extends Model
{

    protected $guarded = [];

    protected $appends = [ 'turns', 'manuals', 'automatics' ];

    protected $casts = [
        'created_at' => 'datetime:M jS g:ia',
    ];

    public function players()
    {
        return $this->belongsToMany( User::class );
    }

    public function saves()
    {
        return $this->hasMany( Save::class );
    }

    public function getTurnsAttribute(){
        return $this->getSaveByType( 'turn' )->get();
    }

    public function getManualsAttribute(){
        return $this->getSaveByType( 'manual' )->get();
    }

    public function getAutomaticsAttribute(){
        return $this->getSaveByType( 'automatic' )->take( 3 )->get();
    }


    public function getSaveByType( $type )
    {
        return $this->saves()
            ->select( 'id', 'type', 'created_at' )
            ->where( 'type', $type )
            ->orderByDesc( 'created_at' );
    }

}
