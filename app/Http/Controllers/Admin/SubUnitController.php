<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreSubUnitRequest;
use App\Http\Requests\Admin\UpdateSubUnitRequest;
use App\Http\Resources\SubUnitResource;
use App\Models\SubUnit;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\ResourceCollection;

class SubUnitController extends Controller
{
    public function index(): ResourceCollection
    {
        $query = SubUnit::query()
            ->with('unit:id,name,code')
            ->orderBy('name');

        if ($unitId = request()->query('unit_id')) {
            $query->where('unit_id', $unitId);
        }

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

        return SubUnitResource::collection(
            $query->paginate(request()->integer('per_page', 20))
        );
    }

    public function store(StoreSubUnitRequest $request): JsonResponse
    {
        $subUnit = SubUnit::create($request->validated());

        return (new SubUnitResource($subUnit->load('unit:id,name,code')))->response()->setStatusCode(201);
    }

    public function show(SubUnit $subUnit): SubUnitResource
    {
        return new SubUnitResource($subUnit->load('unit:id,name,code'));
    }

    public function update(UpdateSubUnitRequest $request, SubUnit $subUnit): SubUnitResource
    {
        $subUnit->update($request->validated());

        return new SubUnitResource($subUnit->refresh()->load('unit:id,name,code'));
    }

    public function destroy(SubUnit $subUnit): JsonResponse
    {
        $subUnit->delete();

        return response()->json(null, 204);
    }
}
