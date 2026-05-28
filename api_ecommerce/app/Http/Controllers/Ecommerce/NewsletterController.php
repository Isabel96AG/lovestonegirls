<?php

namespace App\Http\Controllers\Ecommerce;

use App\Http\Controllers\Controller;
use App\Models\NewsletterSubscriber;
use Illuminate\Http\Request;

class NewsletterController extends Controller
{
    public function subscribe(Request $request)
    {
        $request->validate(['email' => 'required|email']);

        $exists = NewsletterSubscriber::where('email', $request->email)->exists();

        if ($exists) {
            return response()->json(['message' => 'Ya estás suscrito'], 200);
        }

        NewsletterSubscriber::create(['email' => $request->email]);

        return response()->json(['message' => 'Suscrito correctamente'], 201);
    }
}
