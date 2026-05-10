<?php

namespace App\Models\Sale;

use Illuminate\Database\Eloquent\Model;
use App\Models\Product\Product;

class SaleDetail extends Model
{
    protected $fillable = [
        'sale_id',
        'product_id',
        'type_discount',
        'discount',
        'quantity',
        'code_cupone',
        'code_discount',
        'price_unit',
        'subtotal',
        'total',
    ];

    // Cada línea de detalle pertenece a un pedido
    public function sale()
    {
        return $this->belongsTo(Sale::class);
    }

    // Cada línea está asociada a un producto
    public function product()
    {
        return $this->belongsTo(Product::class);
    }
}
