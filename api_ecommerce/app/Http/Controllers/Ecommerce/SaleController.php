<?php

namespace App\Http\Controllers\Ecommerce;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Sale\Sale;
use App\Models\Sale\SaleAddress;
use App\Models\Sale\SaleDetail;
use App\Models\Sale\Cart as CartModel;
use Stripe\Stripe;
use Stripe\PaymentIntent;

class SaleController extends Controller
{
    // Devuelve todos los pedidos del usuario logueado
    public function index()
    {
        $sales = Sale::where('user_id', auth('api')->id())
            ->with(['address', 'details.product'])
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json(['sales' => $sales]);
    }

    // Crea un nuevo pedido con los productos del carrito
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

        // Recogemos los items del carrito del usuario
        $carts = CartModel::where('user_id', $userId)->get();

        if ($carts->isEmpty()) {
            return response()->json(['error' => 'El carrito está vacío'], 400);
        }

        // Calculamos el total del pedido sumando todos los items
        $subtotal = $carts->sum('total');
        $total    = $subtotal;

        // Si el método de pago es tarjeta procesamos el cobro con Stripe
        if ($request->method_payment === 'tarjeta') {

            // necesitamos el id del método de pago que nos manda Angular
            if (!$request->payment_method_id) {
                return response()->json(['error' => 'Falta el método de pago de Stripe'], 400);
            }

            // configuramos Stripe con nuestra clave secreta del .env
            Stripe::setApiKey(env('STRIPE_SECRET'));

            try {
                // creamos un PaymentIntent — Stripe cobra el importe en céntimos
                $intent = PaymentIntent::create([
                    'amount'               => intval($total * 100), // Stripe usa céntimos
                    'currency'             => 'eur',
                    'payment_method'       => $request->payment_method_id,
                    'confirm'              => true, // confirma el pago inmediatamente
                    'return_url'           => 'http://localhost:4200/order-confirmation',
                ]);

                // si el pago no se completó devolvemos error
                if ($intent->status !== 'succeeded') {
                    return response()->json(['error' => 'El pago no pudo completarse'], 400);
                }

                $n_transaccion = $intent->id;

            } catch (\Exception $e) {
                \Log::error('Stripe error: ' . $e->getMessage());
                return response()->json(['error' => 'Error al procesar el pago: ' . $e->getMessage()], 400);
            }
        }

        // Creamos el pedido principal
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

        // Guardamos la dirección de envío
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

        // Guardamos cada producto del carrito como detalle del pedido
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

        // Vaciamos el carrito una vez confirmado el pedido
        CartModel::where('user_id', $userId)->delete();

        return response()->json([
            'message' => 'Pedido realizado correctamente',
            'sale'    => $sale->load(['address', 'details']),
        ], 201);
    }

    // Devuelve el detalle de un pedido concreto
    public function show(int $id)
    {
        $sale = Sale::where('user_id', auth('api')->id())
            ->with(['address', 'details.product'])
            ->findOrFail($id);

        return response()->json(['sale' => $sale]);
    }
}
