<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('slug')->unique();
            $table->decimal('price', 8, 2);
            $table->text('resumen')->nullable();
            $table->longText('description')->nullable();
            $table->string('image');
            $table->json('tags')->nullable();
            // categorias: nivel 1 departamento, nivel 2 categoria, nivel 3 subcategoria
            $table->unsignedBigInteger('categorie_first_id')->nullable();
            $table->unsignedBigInteger('categorie_second_id')->nullable();
            $table->unsignedBigInteger('categorie_third_id')->nullable();
            $table->integer('state')->default(1); // 1=borrador, 2=publicado
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
