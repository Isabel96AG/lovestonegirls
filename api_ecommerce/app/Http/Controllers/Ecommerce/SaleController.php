<?php

namespace App\Http\Controllers\Ecommerce;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Sale\Sale;
use App\Models\Sale\SaleAddress;
use App\Models\Sale\SaleDetail;
use App\Models\Sale\Cart as CartModel;
use App\Models\Product\Product;
use Stripe\Stripe;
use Stripe\PaymentIntent;

class SaleController extends Controller
{
    public function index()
    {
        $sales = Sale::where('user_id', auth('api')->id())
            ->with(['address', 'details.product'])
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json(['sales' => $sales]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'method_payment' => 'required|string',
            'name'           => 'required|string',
            'surname'        => 'required|string',
            'phone'          => 'required|string',
            'address'        => 'required|string',
            'city'           => 'required|string',
            'postal_code'    => 'required|string',
        ]);

        $userId = auth('api')->id();

        $carts = CartModel::where('user_id', $userId)->get();

        if ($carts->isEmpty()) {
            return response()->json(['error' => 'El carrito está vacío'], 400);
        }

        $subtotal = $carts->sum('total');
        $total    = $subtotal;

        if ($request->method_payment === 'tarjeta') {

            if (!$request->payment_method_id) {
                return response()->json(['error' => 'Falta el método de pago de Stripe'], 400);
            }

            Stripe::setApiKey(env('STRIPE_SECRET'));

            try {
                $intent = PaymentIntent::create([
                    'amount'         => intval($total * 100),
                    'currency'       => 'eur',
                    'payment_method' => $request->payment_method_id,
                    'confirm'        => true,
                    'return_url'     => 'http://localhost:4200/order-confirmation',
                ]);

                if ($intent->status !== 'succeeded') {
                    return response()->json(['error' => 'El pago no pudo completarse'], 400);
                }

                $n_transaccion = $intent->id;

            } catch (\Exception $e) {
                \Log::error('Stripe error: ' . $e->getMessage());
                return response()->json(['error' => 'Error al procesar el pago: ' . $e->getMessage()], 400);
            }
        }

        $sale = Sale::create([
            'user_id'          => $userId,
            'method_payment'   => $request->method_payment,
            'currency_total'   => 'EUR',
            'currency_payment' => 'EUR',
            'discount'         => 0,
            'subtotal'         => $subtotal,
            'total'            => $total,
            'n_transaccion'    => $n_transaccion ?? null,
            'state'            => 'pendiente',
        ]);

        SaleAddress::create([
            'sale_id'     => $sale->id,
            'name'        => $request->name,
            'surname'     => $request->surname,
            'phone'       => $request->phone,
            'address'     => $request->address,
            'city'        => $request->city,
            'province'    => $request->province ?? '',
            'postal_code' => $request->postal_code,
            'country'     => $request->country ?? 'España',
            'notes'       => $request->notes ?? '',
        ]);

        foreach ($carts as $cart) {
            SaleDetail::create([
                'sale_id'    => $sale->id,
                'product_id' => $cart->product_id,
                'quantity'   => $cart->quantity,
                'price_unit' => $cart->price_unit,
                'subtotal'   => $cart->total,
                'total'      => $cart->total,
                'discount'   => 0,
            ]);
        }

        foreach ($carts as $cart) {
            Product::where('id', $cart->product_id)->update(['state' => 3]);
        }

        CartModel::where('user_id', $userId)->delete();

        return response()->json([
            'message' => 'Pedido realizado correctamente',
            'sale'    => $sale->load(['address', 'details']),
        ], 201);
    }

    public function show(int $id)
    {
        $sale = Sale::where('user_id', auth('api')->id())
            ->with(['address', 'details.product'])
            ->findOrFail($id);

        return response()->json(['sale' => $sale]);
    }
}
