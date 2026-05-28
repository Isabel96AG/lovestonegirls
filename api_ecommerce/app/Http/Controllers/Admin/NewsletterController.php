<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\NewsletterSubscriber;

class NewsletterController extends Controller
{
    public function index()
    {
        $search = request('search', '');
        $subscribers = NewsletterSubscriber::when($search, fn($q) => $q->where('email', 'like', "%$search%"))
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return response()->json([
            'subscribers' => $subscribers->items(),
            'total'       => $subscribers->total(),
        ]);
    }

    public function destroy(int $id)
    {
        NewsletterSubscriber::findOrFail($id)->delete();
        return response()->json(['message' => 'Eliminado']);
    }
}
