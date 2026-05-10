<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Dirección de envío asociada a cada pedido
        Schema::create('sale_addresses', function (Blueprint $table) {
            $table->id();
            // Cada dirección pertenece a una venta
            $table->foreignId('sale_id')->constrained('sales')->onDelete('cascade');
            $table->string('name');
            $table->string('surname');
            $table->string('phone', 20);
            $table->string('address');
            $table->string('city');
            $table->string('province')->nullable();
            $table->string('postal_code', 10);
            $table->string('country')->default('España');
            // Notas adicionales del cliente para el envío
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sale_addresses');
    }
};
