<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class AdminUserController extends Controller
{
    public function index()
    {
        $admins = User::where('type_user', 1)
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(fn($u) => [
                'id'    => $u->id,
                'name'  => $u->name . ' ' . $u->surname,
                'email' => $u->email,
                'phone' => $u->phone,
                'created_at' => $u->created_at->format('d/m/Y'),
            ]);

        return response()->json(['admins' => $admins]);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name'     => 'required|string|min:2|max:50',
            'surname'  => 'required|string|min:2|max:100',
            'email'    => 'required|email|unique:users,email',
            'password' => 'required|string|min:8',
            'phone'    => 'required|digits:9',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $user = User::create([
            'name'               => $request->name,
            'surname'            => $request->surname,
            'email'              => $request->email,
            'password'           => bcrypt($request->password),
            'phone'              => $request->phone,
            'type_user'          => 1,
            'uniqd'              => uniqid(),
            'email_verified_at'  => now(),
        ]);

        return response()->json([
            'message' => 200,
            'admin'   => [
                'id'    => $user->id,
                'name'  => $user->name . ' ' . $user->surname,
                'email' => $user->email,
                'phone' => $user->phone,
                'created_at' => $user->created_at->format('d/m/Y'),
            ],
        ], 201);
    }

    public function destroy(int $id)
    {
        $admin = User::where('id', $id)->where('type_user', 1)->firstOrFail();

        if (User::where('type_user', 1)->count() <= 1) {
            return response()->json(['error' => 'No puedes eliminar el único administrador'], 422);
        }

        $admin->delete();
        return response()->json(['message' => 200]);
    }
}
