<?php

namespace App\Models\Sale;

use Illuminate\Database\Eloquent\Model;
use App\Models\Product\Product;

class Cart extends Model
{
    protected $fillable = [
        'user_id',
        'product_id',
        'quantity',
        'price_unit',
        'total',
        'variations',
    ];

    protected $casts = [
        'variations' => 'array',
    ];

    public function product()
    {
        return $this->belongsTo(Product::class);
    }
}
