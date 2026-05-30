<?php

namespace App\Http\Controllers\Admin\Product;

use App\Http\Controllers\Controller;
use App\Models\Product\Attribute;
use App\Models\Product\Categorie;
use App\Models\Product\Product;
use App\Models\Product\ProductImage;
use App\Models\Product\ProductVariation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ProductController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->search;
        $products = Product::where('title', 'like', '%' . $search . '%')
            ->orderBy('id', 'desc')
            ->paginate(15);

        return response()->json([
            'total' => $products->total(),
            'products' => $products->map(function ($p) {
                return [
                    'id' => $p->id,
                    'title' => $p->title,
                    'price' => $p->price,
                    'state' => $p->state,
                    'image' => $p->image ? asset('storage/' . $p->image) : null,
                    'created_at' => $p->created_at,
                ];
            }),
        ]);
    }

    public function config()
    {
        $categories_first = Categorie::whereNull('categorie_second_id')->whereNull('categorie_third_id')->get();
        $categories_seconds = Categorie::whereNotNull('categorie_second_id')->whereNull('categorie_third_id')->get();
        $categories_thirds = Categorie::whereNotNull('categorie_third_id')->get();
        $attributes = Attribute::with('properties')->where('state', 1)->get();

        return response()->json([
            'categories_first' => $categories_first,
            'categories_seconds' => $categories_seconds,
            'categories_thirds' => $categories_thirds,
            'attributes' => $attributes,
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->except(['image', 'variations']);
        $data['slug'] = Str::slug($request->title) . '-' . uniqid();

        if ($request->hasFile('image')) {
            $data['image'] = Storage::disk('public')->putFile('products', $request->file('image'));
        }

        $product = Product::create($data);

        if ($request->variations) {
            $variations = json_decode($request->variations, true);
            foreach ($variations as $variation) {
                if (!empty($variation['propertie_id'])) {
                    ProductVariation::create([
                        'product_id' => $product->id,
                        'attribute_id' => $variation['attribute_id'],
                        'propertie_id' => $variation['propertie_id'],
                    ]);
                }
            }
        }

        return response()->json(['message' => 200, 'product' => $product]);
    }

    public function show(string $id)
    {
        $product = Product::with(['images', 'variations.attribute', 'variations.propertie',
            'categorie_first', 'categorie_second', 'categorie_third'])->findOrFail($id);

        return response()->json([
            'product' => [
                'id' => $product->id,
                'title' => $product->title,
                'slug' => $product->slug,
                'price' => $product->price,
                'description' => $product->description,
                'state' => $product->state,
                'image' => $product->image ? asset('storage/' . $product->image) : null,
                'categorie_first_id' => $product->categorie_first_id,
                'categorie_second_id' => $product->categorie_second_id,
                'categorie_third_id' => $product->categorie_third_id,
                'images' => $product->images->map(fn($i) => [
                    'id' => $i->id,
                    'image' => asset('storage/' . $i->image),
                ]),
                'variations' => $product->variations->map(fn($v) => [
                    'id' => $v->id,
                    'attribute_id' => $v->attribute_id,
                    'propertie_id' => $v->propertie_id,
                ]),
            ],
        ]);
    }

    public function update(Request $request, string $id)
    {
        $product = Product::findOrFail($id);

        $data = $request->except(['image', 'variations']);

        if ($request->hasFile('image')) {
            if ($product->image) {
                Storage::disk('public')->delete($product->image);
            }
            $data['image'] = Storage::disk('public')->putFile('products', $request->file('image'));
        }

        $product->update($data);

        if ($request->variations) {
            $product->variations()->delete();
            $variations = json_decode($request->variations, true);
            foreach ($variations as $variation) {
                if (!empty($variation['propertie_id'])) {
                    ProductVariation::create([
                        'product_id' => $product->id,
                        'attribute_id' => $variation['attribute_id'],
                        'propertie_id' => $variation['propertie_id'],
                    ]);
                }
            }
        }

        return response()->json(['message' => 200, 'product' => $product]);
    }

    public function destroy(string $id)
    {
        $product = Product::findOrFail($id);
        if ($product->image) {
            Storage::disk('public')->delete($product->image);
        }
        $product->delete();

        return response()->json(['message' => 200]);
    }

    public function deleteImage(string $id)
    {
        $image = ProductImage::findOrFail($id);
        Storage::disk('public')->delete($image->image);
        $image->delete();

        return response()->json(['message' => 200]);
    }
}
