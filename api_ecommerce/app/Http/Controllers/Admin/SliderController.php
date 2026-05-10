<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Slider;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class SliderController extends Controller
{
    public function index()
    {
        $sliders = Slider::orderBy('id', 'desc')->get();

        return response()->json([
            'sliders' => $sliders->map(fn($s) => [
                'id' => $s->id,
                'title' => $s->title,
                'subtitle' => $s->subtitle,
                'label' => $s->label,
                'link' => $s->link,
                'type_slider' => $s->type_slider,
                'state' => $s->state,
                'image' => $s->image ? asset('storage/' . $s->image) : null,
            ]),
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->except('image');

        if ($request->hasFile('image')) {
            $data['image'] = Storage::disk('public')->putFile('sliders', $request->file('image'));
        }

        $slider = Slider::create($data);

        return response()->json(['message' => 200, 'slider' => $slider]);
    }

    public function show(string $id)
    {
        $slider = Slider::findOrFail($id);

        return response()->json([
            'slider' => [
                'id' => $slider->id,
                'title' => $slider->title,
                'subtitle' => $slider->subtitle,
                'label' => $slider->label,
                'link' => $slider->link,
                'type_slider' => $slider->type_slider,
                'state' => $slider->state,
                'image' => $slider->image ? asset('storage/' . $slider->image) : null,
            ],
        ]);
    }

    public function update(Request $request, string $id)
    {
        $slider = Slider::findOrFail($id);
        $data = $request->except('image');

        if ($request->hasFile('image')) {
            if ($slider->image) {
                Storage::disk('public')->delete($slider->image);
            }
            $data['image'] = Storage::disk('public')->putFile('sliders', $request->file('image'));
        }

        $slider->update($data);

        return response()->json(['message' => 200]);
    }

    public function destroy(string $id)
    {
        $slider = Slider::findOrFail($id);
        if ($slider->image) {
            Storage::disk('public')->delete($slider->image);
        }
        $slider->delete();

        return response()->json(['message' => 200]);
    }
}
