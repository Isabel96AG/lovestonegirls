<?php

namespace App\Http\Controllers\Ecommerce;

use App\Http\Controllers\Controller;
use App\Models\Sale\Cart;
use App\Models\Product\Product;
use Illuminate\Http\Request;

class CartController extends Controller
{
    public function index()
    {
        $user = auth('api')->user();
        $carts = Cart::with('product')
            ->where('user_id', $user->id)
            ->get()
            ->map(fn($c) => $this->formatCart($c));

        return response()->json(['carts' => $carts]);
    }

    public function store(Request $request)
    {
        $user = auth('api')->user();

        $existe = Cart::where('user_id', $user->id)
            ->where('product_id', $request->product_id)
            ->first();

        if ($existe) {
            return response()->json(['message' => 200, 'cart' => $this->formatCart($existe->load('product'))]);
        }

        $cart = Cart::create([
            'user_id'    => $user->id,
            'product_id' => $request->product_id,
            'quantity'   => 1,
            'price_unit' => $request->price_unit,
            'total'      => $request->price_unit,
            'variations' => $request->variations ?? null,
        ]);

        return response()->json(['message' => 200, 'cart' => $this->formatCart($cart->load('product'))]);
    }

    public function update(Request $request, string $id)
    {
        $cart = Cart::findOrFail($id);
        $cart->update([
            'quantity' => $request->quantity,
            'total'    => $cart->price_unit * $request->quantity,
        ]);

        return response()->json(['message' => 200]);
    }

    public function destroy(string $id)
    {
        Cart::findOrFail($id)->delete();
        return response()->json(['message' => 200]);
    }

    public function deleteAll()
    {
        $user = auth('api')->user();
        Cart::where('user_id', $user->id)->delete();
        return response()->json(['message' => 200]);
    }

    private function formatCart(Cart $c): array
    {
        return [
            'id'         => $c->id,
            'product_id' => $c->product_id,
            'title'      => $c->product->title ?? '',
            'slug'       => $c->product->slug ?? '',
            'image'      => $c->product->image ? asset('storage/' . $c->product->image) : null,
            'price_unit' => $c->price_unit,
            'quantity'   => $c->quantity,
            'total'      => $c->total,
            'variations' => $c->variations,
        ];
    }
}
