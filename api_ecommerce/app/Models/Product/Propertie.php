<?php

namespace App\Models\Product;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Propertie extends Model
{
    use HasFactory;
    use SoftDeletes;
    protected $fillable = [
        'attribute_id',
        'name',
        'code',

    ];

    public function setCreatedAttribute($value)
    {
        date_default_timezone_set("España/Madrid");
        $this->attributes['created_at'] = Carbon::now();
    }
    public function setUpdatedAttribute($value)
    {
        date_default_timezone_set("España/Madrid");
        $this->attributes['updated_at'] = Carbon::now();
    }
}
