<?php

namespace App\Models\Sale;

use Illuminate\Database\Eloquent\Model;
use App\Models\User;

class Sale extends Model
{
    protected $fillable = [
        'user_id',
        'method_payment',
        'currency_total',
        'currency_payment',
        'discount',
        'subtotal',
        'total',
        'price_dolar',
        'n_transaccion',
        'state',
    ];

    // Un pedido pertenece a un usuario
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // Un pedido tiene una dirección de envío
    public function address()
    {
        return $this->hasOne(SaleAddress::class);
    }

    // Un pedido tiene varios productos
    public function details()
    {
        return $this->hasMany(SaleDetail::class);
    }
}
