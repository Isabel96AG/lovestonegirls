<?php

namespace App\Models\Sale;

use Illuminate\Database\Eloquent\Model;

class SaleAddress extends Model
{
    protected $fillable = [
        'sale_id',
        'name',
        'surname',
        'phone',
        'address',
        'city',
        'province',
        'postal_code',
        'country',
        'notes',
    ];

    public function sale()
    {
        return $this->belongsTo(Sale::class);
    }
}
