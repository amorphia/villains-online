<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Save extends Model
{
    protected $guarded = [];

    protected $casts = [
        'created_at' => 'datetime:g:i:s a',
    ];

    public function game()
    {
        return $this->belongsTo( Game::class );
    }
}
