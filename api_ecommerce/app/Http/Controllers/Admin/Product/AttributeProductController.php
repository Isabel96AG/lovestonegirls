<?php

namespace App\Http\Controllers\Admin\Product;

use App\Http\Controllers\Controller;
use App\Models\Product\Attribute;
use App\Models\Product\Propertie;
use Illuminate\Http\Request;

class AttributeProductController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $search = $request->search;
        $attributes = Attribute::with('properties')
            ->where("name", "like", "%" . $search . "%")
            ->orderBy("id", "desc")
            ->paginate(15);

        return response()->json([
            "total" => $attributes->total(),
            "attributes" => $attributes,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {

        $isValida = Attribute::where("name", $request->name)->first();

        if ($isValida) {
            return response()->json(["message" => 403]);
        }
        $attribute = Attribute::create($request->all());

        return response()->json([
            "message" => 200,
            "attributes" => $attribute,
        ]);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $isValida = Attribute::where("id", "<>", $id)->where("name", $request->name)->first();

        if ($isValida) {
            return response()->json(["message" => 403]);
        }
        $attribute = Attribute::findOrFail($id);
        $attribute->update($request->all());
        return response()->json([
            "message" => 200,
            "attributes" => $attribute,
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $attribute = Attribute::findOrFail($id);
        $attribute->delete();
        return response()->json(["message" => 200]);
    }

    public function storeProperty(Request $request)
    {
        $propertie = Propertie::create($request->all());
        return response()->json(["message" => 200, "propertie" => $propertie]);
    }

    public function destroyProperty(string $id)
    {
        $propertie = Propertie::findOrFail($id);
        $propertie->delete();
        return response()->json(["message" => 200]);
    }
}
