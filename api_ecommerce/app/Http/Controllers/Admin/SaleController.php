<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Sale\Sale;
use Illuminate\Http\Request;

class SaleController extends Controller
{
    public function index()
    {
        $search = request('search', '');

        $query = Sale::with(['user'])
            ->orderBy('created_at', 'desc');

        if ($search) {
            $query->whereHas('user', fn($q) => $q->where('name', 'like', "%$search%")
                ->orWhere('email', 'like', "%$search%"));
        }

        $sales = $query->paginate(15);

        return response()->json([
            'sales' => $sales->map(fn($s) => $this->format($s)),
            'total' => $sales->total(),
        ]);
    }

    public function show(int $id)
    {
        $sale = Sale::with(['user', 'address', 'details.product'])->findOrFail($id);
        return response()->json(['sale' => $this->format($sale)]);
    }

    public function update(Request $request, int $id)
    {
        $sale = Sale::findOrFail($id);
        $sale->update(['state' => $request->state]);
        return response()->json(['sale' => $this->format($sale->load(['user', 'address', 'details.product']))]);
    }

    private function format(Sale $s): array
    {
        return [
            'id'             => $s->id,
            'state'          => $s->state,
            'total'          => $s->total,
            'subtotal'       => $s->subtotal,
            'method_payment' => $s->method_payment,
            'n_transaccion'  => $s->n_transaccion,
            'created_at'     => $s->created_at->format('d/m/Y H:i'),
            'user'           => $s->user ? ['name' => $s->user->name, 'email' => $s->user->email] : null,
            'address'        => $s->address,
            'details'        => $s->details->map(fn($d) => [
                'id'         => $d->id,
                'quantity'   => $d->quantity,
                'price_unit' => $d->price_unit,
                'total'      => $d->total,
                'product'    => $d->product ? ['title' => $d->product->title] : null,
            ]),
        ];
    }
}
