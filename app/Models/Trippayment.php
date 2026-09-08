<?php

namespace App\Models;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Trippayment extends Model
{
      use HasFactory;
    protected $guarded=[];
  protected $primaryKey = 'paymentid';
}
