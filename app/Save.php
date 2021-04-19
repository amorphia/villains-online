<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Save extends Model
{

    /**
     * The attributes that are not mass assignable.
     *
     * @var array
     */
    protected $guarded = [];


    /**
     * The attributes that should be cast.
     *
     * @var array
     */
    protected $casts = [
        'created_at' => 'datetime:g:i:s a',
    ];


    /**
     * Get the game that this save state belongs to
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function game()
    {
        return $this->belongsTo( Game::class );
    }
}
