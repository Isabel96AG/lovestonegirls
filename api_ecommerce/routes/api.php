<?php

use App\Http\Controllers\Admin\Product\AttributeProductController;
use App\Http\Controllers\Admin\Product\CategorieController;
use App\Http\Controllers\Admin\Product\ProductController;
use App\Http\Controllers\Admin\SliderController;
use App\Http\Controllers\Admin\EstadisticsController;
use App\Http\Controllers\Admin\SaleController as AdminSaleController;
use App\Http\Controllers\Admin\NewsletterController as AdminNewsletterController;
use App\Http\Controllers\Admin\AdminUserController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\Ecommerce\HomeController;
use App\Http\Controllers\Ecommerce\CartController;
use App\Http\Controllers\Ecommerce\SaleController;
use App\Http\Controllers\Ecommerce\NewsletterController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::group([
    'prefix' => 'auth'
], function ($router) {
    Route::post('/register', [AuthController::class, 'register'])->middleware('auth:api')->name('register');
    Route::post('/login', [AuthController::class, 'login'])->name('login');
    Route::post('/login_ecommerce', [AuthController::class, 'login_ecommerce'])->name('login_ecommerce');
    Route::post('/verified_auth', [AuthController::class, 'verified_auth'])->name('verified_auth');

    Route::middleware('auth:api')->group(function () {
        Route::post('/logout', [AuthController::class, 'logout'])->name('logout');
        Route::post('/refresh', [AuthController::class, 'refresh'])->name('refresh');
        Route::post('/me', [AuthController::class, 'me'])->name('me');
    });
});

Route::group([
    "middleware" => "auth:api",
    "prefix" => "admin",
], function ($router) {
    Route::get("categories/config", [CategorieController::class, "config"]);
    Route::resource("categories", CategorieController::class);
    Route::resource("attributes", AttributeProductController::class);
    Route::post("properties", [AttributeProductController::class, "storeProperty"]);
    Route::delete("properties/{id}", [AttributeProductController::class, "destroyProperty"]);

    Route::get("products/config", [ProductController::class, "config"]);
    Route::delete("products/image/{id}", [ProductController::class, "deleteImage"]);
    Route::resource("products", ProductController::class);

    Route::resource("sliders", SliderController::class);

    Route::get("estadistics", [EstadisticsController::class, "index"]);

    Route::get("sales", [AdminSaleController::class, "index"]);
    Route::get("sales/{id}", [AdminSaleController::class, "show"]);
    Route::put("sales/{id}", [AdminSaleController::class, "update"]);

    Route::get("newsletter", [AdminNewsletterController::class, "index"]);
    Route::delete("newsletter/{id}", [AdminNewsletterController::class, "destroy"]);

    Route::get("admins", [AdminUserController::class, "index"]);
    Route::post("admins", [AdminUserController::class, "store"]);
    Route::delete("admins/{id}", [AdminUserController::class, "destroy"]);
});

// rutas publicas de la tienda
Route::prefix('ecommerce')->group(function () {
    Route::get('home', [HomeController::class, 'home']);
    Route::get('categories', [HomeController::class, 'categories']);
    Route::get('products', [HomeController::class, 'products']);
    Route::get('product/{slug}', [HomeController::class, 'show']);

    // carrito — requiere login
    Route::middleware('auth:api')->group(function () {
        Route::get('carts', [CartController::class, 'index']);
        Route::post('carts', [CartController::class, 'store']);
        Route::put('carts/{id}', [CartController::class, 'update']);
        Route::delete('carts/delete_all', [CartController::class, 'deleteAll']);
        Route::delete('carts/{id}', [CartController::class, 'destroy']);

        // pedidos — crear, listar y ver detalle
        Route::get('sales', [SaleController::class, 'index']);
        Route::post('sales', [SaleController::class, 'store']);
        Route::get('sales/{id}', [SaleController::class, 'show']);
    });

    Route::post('newsletter/subscribe', [NewsletterController::class, 'subscribe']);
});
