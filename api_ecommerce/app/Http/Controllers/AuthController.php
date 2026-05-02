<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Mail;
use App\Http\Controllers\Controller;
use App\Models\User;
use App\Mail\VerifiedMail;

class AuthController extends Controller
{
    public function register()
    {
        $validator = Validator::make(request()->all(), [
            'name' => 'required|string|min:2|max:50',
            'surname' => 'required|string|min:2|max:100',
            'phone' => 'required|digits:9',
            'email' => 'required|email|max:100|unique:users',
            'password' => 'required|string|min:8|max:50',
        ], [
            'name.required' => 'El nombre es obligatorio.',
            'name.min' => 'El nombre debe tener al menos 2 caracteres.',
            'name.max' => 'El nombre no puede superar 50 caracteres.',
            'surname.required' => 'El apellido es obligatorio.',
            'surname.min' => 'El apellido debe tener al menos 2 caracteres.',
            'surname.max' => 'El apellido no puede superar 100 caracteres.',
            'phone.required' => 'El teléfono es obligatorio.',
            'phone.digits' => 'El teléfono debe tener exactamente 9 dígitos.',
            'email.required' => 'El email es obligatorio.',
            'email.email' => 'El email no tiene un formato válido.',
            'email.unique' => 'Este email ya está registrado.',
            'email.max' => 'El email no puede superar 100 caracteres.',
            'password.required' => 'La contraseña es obligatoria.',
            'password.min' => 'La contraseña debe tener al menos 8 caracteres.',
            'password.max' => 'La contraseña no puede superar 50 caracteres.',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors()->toJson(), 400);
        }

        $user = new User;
        $user->name = request()->name;
        $user->surname = request()->surname;
        $user->phone = request()->phone;
        $user->type_user = 2;
        $user->email = request()->email;
        $user->uniqd = uniqid();
        $user->password = bcrypt(request()->password);
        $user->save();

        Mail::to(request()->email)->send(new VerifiedMail($user));

        return response()->json($user, 201);
    }

    public function login()
    {
        $credentials = request(['email', 'password']);

        if (! $token = auth('api')->attempt([
            "email" => request()->email,
            "password" => request()->password,
            "type_user" => 1
        ])) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        return $this->respondWithToken($token);
    }

    public function login_ecommerce()
    {
        $credentials = request(['email', 'password']);

        if (! $token = auth('api')->attempt([
            "email" => request()->email,
            "password" => request()->password,
            "type_user" => 2
        ])) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        if (! auth('api')->user()->email_verified_at) {
            auth('api')->logout();
            return response()->json(['error' => 'Debes verificar tu correo electrónico'], 403);
        }

        return $this->respondWithToken($token);
    }

    function verified_auth(Request $request)
    {
        $user = User::where("uniqd", $request->code_user)->first();
        if ($user) {
            $user->update(["email_verified_at" => now()]);
            return response()->json(["message" => 200]);
        }
        return response()->json(["message" => 403]);
    }

    public function me()
    {
        return response()->json(Auth::guard('api')->user());
    }

    public function logout()
    {
        Auth::guard('api')->logout();

        return response()->json(['message' => 'Sesión cerrada correctamente']);
    }

    public function refresh()
    {
        return $this->respondWithToken(Auth::guard('api')->refresh());
    }

    protected function respondWithToken($token)
    {
        return response()->json([
            'access_token' => $token,
            'token_type'   => 'bearer',
            'expires_in'   => Auth::guard('api')->factory()->getTTL() * 60,
            'user'         => [
                "full_name" => auth('api')->user()->name . ' ' . auth('api')->user()->surname,
                "email" => auth('api')->user()->email,
            ],
        ]);
    }
}
