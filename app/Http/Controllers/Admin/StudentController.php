<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreStudentRequest;
use App\Http\Requests\Admin\UpdateStudentRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\ResourceCollection;
use Illuminate\Support\Facades\Hash;

class StudentController extends Controller
{
    public function index(): ResourceCollection
    {
        $students = User::query()
            ->where('role', 'student')
            ->with(['unit:id,name', 'subUnit:id,name,unit_id'])
            ->withCount(['enrollments', 'submissions'])
            ->latest()
            ->when(request()->filled('unit_id'), fn ($query) => $query->where('unit_id', request()->query('unit_id')))
            ->when(request()->filled('sub_unit_id'), fn ($query) => $query->where('sub_unit_id', request()->query('sub_unit_id')))
            ->when(request()->filled('search'), function ($query) {
                $search = request()->query('search');
                $query->where(function ($builder) use ($search) {
                    $builder
                        ->where('name', 'ilike', "%{$search}%")
                        ->orWhere('email', 'ilike', "%{$search}%");
                });
            })
            ->paginate(request()->integer('per_page', 15));

        return UserResource::collection($students);
    }

    public function store(StoreStudentRequest $request): JsonResponse
    {
        $payload = $request->validated();
        $payload['role'] = 'student';
        $payload['password'] = Hash::make($payload['password']);

        $student = User::create($payload);

        return (new UserResource(
            $student->load([
                'unit:id,name',
                'subUnit:id,name,unit_id',
            ])->loadCount(['enrollments', 'submissions'])
        ))->response()->setStatusCode(201);
    }

    public function show(User $student): UserResource
    {
        abort_unless($student->role === 'student', 404);

        $student->loadCount(['enrollments', 'submissions'])
            ->load([
                'enrollments.course:id,title,slug',
                'unit:id,name',
                'subUnit:id,name,unit_id',
            ]);

        return new UserResource($student);
    }

    public function update(UpdateStudentRequest $request, User $student): UserResource
    {
        abort_unless($student->role === 'student', 404);

        $payload = $request->validated();

        if (! empty($payload['password'])) {
            $payload['password'] = Hash::make($payload['password']);
        } else {
            unset($payload['password']);
        }

        $student->update($payload);

        return new UserResource(
            $student->refresh()
                ->load([
                    'unit:id,name',
                    'subUnit:id,name,unit_id',
                ])
                ->loadCount(['enrollments', 'submissions'])
        );
    }

    public function destroy(User $student): JsonResponse
    {
        abort_unless($student->role === 'student', 404);

        $student->delete();

        return response()->json(null, 204);
    }
}
