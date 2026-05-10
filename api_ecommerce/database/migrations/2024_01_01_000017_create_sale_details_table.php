<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Detalle de productos de cada pedido (una fila por producto)
        Schema::create('sale_details', function (Blueprint $table) {
            $table->id();
            // A qué pedido pertenece este detalle
            $table->foreignId('sale_id')->constrained('sales')->onDelete('cascade');
            $table->foreignId('product_id')->constrained()->onDelete('cascade');
            // Tipo de descuento aplicado a este producto (cupón, promoción...)
            $table->string('type_discount')->nullable();
            $table->decimal('discount', 10, 2)->default(0);
            $table->integer('quantity');
            // Códigos de cupón y descuento si se aplicaron
            $table->string('code_cupone')->nullable();
            $table->string('code_discount')->nullable();
            $table->decimal('price_unit', 10, 2);
            $table->decimal('subtotal', 10, 2);
            $table->decimal('total', 10, 2);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sale_details');
    }
};
