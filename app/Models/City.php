<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class City extends Model
{
    
    protected $primaryKey = 'cityid';

    public function state()
    {
        return $this->belongsTo(State::class, 'stateid', 'stateid');
    }
}
