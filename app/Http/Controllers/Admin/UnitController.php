<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreUnitRequest;
use App\Http\Requests\Admin\UpdateUnitRequest;
use App\Http\Resources\UnitResource;
use App\Models\Unit;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\ResourceCollection;

class UnitController extends Controller
{
    public function index(): ResourceCollection
    {
        $query = Unit::query()
            ->withCount('subUnits')
            ->orderBy('name');

        if ($search = request()->query('search')) {
            $query->where(function ($builder) use ($search) {
                $builder
                    ->where('name', 'ilike', "%{$search}%")
                    ->orWhere('code', 'ilike', "%{$search}%");
            });
        }

        if (($isActive = request()->query('is_active')) !== null) {
            $parsed = filter_var($isActive, FILTER_VALIDATE_BOOL, FILTER_NULL_ON_FAILURE);
            if ($parsed !== null) {
                $query->where('is_active', $parsed);
            }
        }

        return UnitResource::collection(
            $query->paginate(request()->integer('per_page', 15))
        );
    }

    public function store(StoreUnitRequest $request): JsonResponse
    {
        $unit = Unit::create($request->validated());

        return (new UnitResource($unit))->response()->setStatusCode(201);
    }

    public function show(Unit $unit): UnitResource
    {
        $unit->load(['subUnits' => fn ($query) => $query->orderBy('name')]);

        return new UnitResource($unit);
    }

    public function update(UpdateUnitRequest $request, Unit $unit): UnitResource
    {
        $unit->update($request->validated());

        return new UnitResource($unit->refresh()->load(['subUnits' => fn ($query) => $query->orderBy('name')]));
    }

    public function destroy(Unit $unit): JsonResponse
    {
        $unit->delete();

        return response()->json(null, 204);
    }
}
