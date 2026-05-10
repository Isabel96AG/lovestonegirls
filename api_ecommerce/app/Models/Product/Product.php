<?php

namespace App\Models\Product;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Product extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'title',
        'slug',
        'price',
        'description',
        'image',
        'categorie_first_id',
        'categorie_second_id',
        'categorie_third_id',
        'state',
    ];

    public function images()
    {
        return $this->hasMany(ProductImage::class);
    }

    public function variations()
    {
        return $this->hasMany(ProductVariation::class);
    }

    public function categorie_first()
    {
        return $this->belongsTo(Categorie::class, 'categorie_first_id');
    }

    public function categorie_second()
    {
        return $this->belongsTo(Categorie::class, 'categorie_second_id');
    }

    public function categorie_third()
    {
        return $this->belongsTo(Categorie::class, 'categorie_third_id');
    }
}
