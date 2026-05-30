<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Sale\Sale;
use App\Models\Sale\SaleDetail;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class EstadisticsController extends Controller
{
    public function index()
    {
        $hoy = Sale::whereDate('created_at', today())->sum('total');

        $esteMes = Sale::whereMonth('created_at', now()->month)
            ->whereYear('created_at', now()->year)
            ->sum('total');

        $esteAnio = Sale::whereYear('created_at', now()->year)->sum('total');

        $totalClientes = Sale::distinct('user_id')->count('user_id');

        $ventasPorMes = Sale::select(
                DB::raw('MONTH(created_at) as mes'),
                DB::raw('YEAR(created_at) as anio'),
                DB::raw('SUM(total) as total')
            )
            ->where('created_at', '>=', now()->subMonths(11)->startOfMonth())
            ->groupBy('anio', 'mes')
            ->orderBy('anio')
            ->orderBy('mes')
            ->get();

        $productosMasVendidos = SaleDetail::select('product_id', DB::raw('SUM(quantity) as total_vendido'))
            ->with('product:id,title,image,price')
            ->groupBy('product_id')
            ->orderByDesc('total_vendido')
            ->limit(5)
            ->get()
            ->map(fn($d) => [
                'producto' => $d->product?->title,
                'imagen'   => $d->product?->image ? asset('storage/' . $d->product->image) : null,
                'precio'   => $d->product?->price,
                'vendidos' => $d->total_vendido,
            ]);

        $clientes = User::whereHas('sales')
            ->withCount('sales')
            ->withSum('sales', 'total')
            ->withMax('sales', 'created_at')
            ->orderByDesc('sales_sum_total')
            ->limit(10)
            ->get()
            ->map(fn($u) => [
                'nombre'        => $u->name . ' ' . $u->surname,
                'email'         => $u->email,
                'telefono'      => $u->phone ?? '-',
                'total_gastado' => round($u->sales_sum_total, 2),
                'ultimo_pedido' => $u->sales_max_created_at
                                    ? \Carbon\Carbon::parse($u->sales_max_created_at)->format('d/m/Y')
                                    : '-',
                'num_pedidos'   => $u->sales_count,
            ]);

        return response()->json([
            'kpis' => [
                'hoy'            => round($hoy, 2),
                'este_mes'       => round($esteMes, 2),
                'este_anio'      => round($esteAnio, 2),
                'total_clientes' => $totalClientes,
            ],
            'ventas_por_mes'         => $ventasPorMes,
            'productos_mas_vendidos' => $productosMasVendidos,
            'clientes'               => $clientes,
        ]);
    }
}
