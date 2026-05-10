<?php

namespace App\Http\Controllers\Ecommerce;

use App\Http\Controllers\Controller;
use App\Models\Product\Categorie;
use App\Models\Product\Product;
use App\Models\Slider;

class HomeController extends Controller
{
    public function home()
    {
        $sliders = Slider::where('state', 1)->orderBy('id', 'desc')->get()->map(fn($s) => [
            'id' => $s->id,
            'title' => $s->title,
            'subtitle' => $s->subtitle,
            'label' => $s->label,
            'link' => $s->link,
            'type_slider' => $s->type_slider,
            'image' => $s->image ? asset('storage/' . $s->image) : null,
        ]);

        $products = Product::where('state', 2)
            ->orderBy('id', 'desc')
            ->take(8)
            ->get()
            ->map(fn($p) => $this->formatProduct($p));

        // nivel 1: Ropa, Accesorios...
        $categories = Categorie::whereNull('categorie_second_id')
            ->whereNull('categorie_third_id')
            ->get();

        // nivel 2: Tops, Vestidos, Faldas...
        $categories_second = Categorie::whereNotNull('categorie_second_id')
            ->whereNull('categorie_third_id')
            ->get();

        // nivel 3: Camisetas, Blusas...
        $categories_third = Categorie::whereNotNull('categorie_third_id')
            ->get();

        return response()->json([
            'sliders' => $sliders,
            'products' => $products,
            'categories' => $categories,
            'categories_second' => $categories_second,
            'categories_third' => $categories_third,
        ]);
    }

    public function categories()
    {
        $categories = Categorie::whereNull('categorie_second_id')
            ->whereNull('categorie_third_id')
            ->get();

        return response()->json(['categories' => $categories]);
    }

    public function products()
    {
        $search = request('search', '');
        $categorie_id = request('categorie_id', null);

        $query = Product::where('state', 2);

        if ($search) {
            $query->where('title', 'like', '%' . $search . '%');
        }

        if ($categorie_id) {
            // buscar también productos asignados a subcategorías de esta categoría
            $sub_ids = Categorie::where('categorie_second_id', $categorie_id)
                ->orWhere('categorie_third_id', $categorie_id)
                ->pluck('id')
                ->toArray();

            $all_ids = array_merge([$categorie_id], $sub_ids);

            $query->where(function ($q) use ($all_ids) {
                $q->whereIn('categorie_first_id', $all_ids)
                    ->orWhereIn('categorie_second_id', $all_ids)
                    ->orWhereIn('categorie_third_id', $all_ids);
            });
        }

        $products = $query->orderBy('id', 'desc')->paginate(12);

        return response()->json([
            'total' => $products->total(),
            'products' => $products->map(fn($p) => $this->formatProduct($p)),
        ]);
    }

    public function show(string $slug)
    {
        $product = Product::with(['images', 'variations.attribute', 'variations.propertie',
            'categorie_first', 'categorie_second', 'categorie_third'])
            ->where('slug', $slug)
            ->where('state', 2)
            ->firstOrFail();

        return response()->json([
            'product' => [
                'id' => $product->id,
                'title' => $product->title,
                'slug' => $product->slug,
                'price' => $product->price,
                'description' => $product->description,
                'image' => $product->image ? asset('storage/' . $product->image) : null,
                'images' => $product->images->map(fn($i) => asset('storage/' . $i->image)),
                'categorie_first' => $product->categorie_first?->name,
                'categorie_second' => $product->categorie_second?->name,
                'categorie_third' => $product->categorie_third?->name,
                'variations' => $product->variations->map(fn($v) => [
                    'attribute' => $v->attribute?->name,
                    'propertie' => $v->propertie?->name,
                ]),
            ],
        ]);
    }

    private function formatProduct(Product $p)
    {
        return [
            'id' => $p->id,
            'title' => $p->title,
            'slug' => $p->slug,
            'price' => $p->price,
            'image' => $p->image ? asset('storage/' . $p->image) : null,
        ];
    }
}
