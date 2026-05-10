<?php

namespace App\Models\Product;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class ProductVariation extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'product_id',
        'attribute_id',
        'propertie_id',
    ];

    public function attribute()
    {
        return $this->belongsTo(Attribute::class);
    }

    public function propertie()
    {
        return $this->belongsTo(Propertie::class);
    }
}
