<?php

namespace App\Http\Resources\Product;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\ResourceCollection;

class CategorieCollection extends ResourceCollection
{
    public function toArray(Request $request): array
    {
        return [
            "data" => CategorieResource::collection($this->collection),
        ];
    }
}
