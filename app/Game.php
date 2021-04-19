<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Game extends Model
{

    /**
     * The attributes that are not mass assignable.
     *
     * @var array
     */
    protected $guarded = [];


    /**
     * The attributes that should be appended to json output.
     *
     * @var array
     */
    protected $appends = [ 'turns', 'manuals', 'automatics' ];


    /**
     * The attributes that should be cast.
     *
     * @var array
     */
    protected $casts = [
        'created_at' => 'datetime:M jS g:ia',
    ];



    /*
    |--------------------------------------------------------------------------
    | Relationships
    |--------------------------------------------------------------------------
    */


    /**
     * Get the players participating in this game
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsToMany
     */
    public function players()
    {
        return $this->belongsToMany( User::class );
    }


    /**
     * Get the save states for this game
     *
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function saves()
    {
        return $this->hasMany( Save::class );
    }



    /*
    |--------------------------------------------------------------------------
    | Attributes
    |--------------------------------------------------------------------------
    */


    /**
     * Get our "turn" type save states
     *
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function getTurnsAttribute(){
        return $this->getSaveByType( 'turn' )->get();
    }


    /**
     * Get our "Manual" type save states
     *
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function getManualsAttribute(){
        return $this->getSaveByType( 'manual' )->get();
    }


    /**
     * Get our "Automatic" type save states
     *
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function getAutomaticsAttribute(){
        return $this->getSaveByType( 'automatic' )->get();
    }



    /*
    |--------------------------------------------------------------------------
    | Methods
    |--------------------------------------------------------------------------
    */


    /**
     * Get our save states of the given type
     *
     * @param string $type
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function getSaveByType( string $type )
    {
        return $this->saves()
            ->select( 'id', 'type', 'created_at', 'active_player', 'action', 'turn' )
            ->where( 'type', $type )
            ->orderByDesc( 'created_at' );
    }


    /**
     * Delete our oldest save state if we have exceeded our
     * maximum save states for this game
     */
    public function deleteOldSave(){

        $saves = $this->saves()
            ->where('type', 'automatic')
            ->orderBy( 'created_at' )
            ->get();

        if( $saves->count() > config( 'app.max_saves') ){
            $saves->first()->delete();
        }
    }

}
