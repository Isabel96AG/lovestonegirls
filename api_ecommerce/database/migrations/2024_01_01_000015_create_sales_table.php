<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Tabla principal de ventas/pedidos
        Schema::create('sales', function (Blueprint $table) {
            $table->id();
            // Usuario que realiza la compra
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            // Método de pago usado (tarjeta, transferencia...)
            $table->string('method_payment')->default('tarjeta');
            // Moneda del total y del pago
            $table->string('currency_total')->default('EUR');
            $table->string('currency_payment')->default('EUR');
            // Descuento aplicado al pedido completo
            $table->decimal('discount', 10, 2)->default(0);
            $table->decimal('subtotal', 10, 2);
            $table->decimal('total', 10, 2);
            // Precio en dólares por si se necesita conversión
            $table->decimal('price_dolar', 10, 2)->nullable();
            // Número de transacción que devuelve la pasarela de pago
            $table->string('n_transaccion')->nullable();
            // Estado del pedido: pendiente, pagado, enviado, cancelado
            $table->string('state')->default('pendiente');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sales');
    }
};
