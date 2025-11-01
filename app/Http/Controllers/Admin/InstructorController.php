<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreInstructorRequest;
use App\Http\Requests\Admin\UpdateInstructorRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\ResourceCollection;
use Illuminate\Support\Facades\Hash;

class InstructorController extends Controller
{
    public function index(): ResourceCollection
    {
        $instructors = User::query()
            ->where('role', 'instructor')
            ->withCount(['teachingCourses'])
            ->with([
                'unit:id,name,code',
                'teachingCourses' => function ($query) {
                    $query->select('id', 'title', 'status', 'slug', 'instructor_id')
                        ->withCount('enrollments')
                        ->latest();
                },
            ])
            ->when(request()->filled('search'), function ($query) {
                $search = request()->query('search');
                $query->where(function ($builder) use ($search) {
                    $builder
                        ->where('name', 'ilike', "%{$search}%")
                        ->orWhere('email', 'ilike', "%{$search}%");
                });
            })
            ->paginate(request()->integer('per_page', 15));

        return UserResource::collection($instructors);
    }

    public function store(StoreInstructorRequest $request): JsonResponse
    {
        $payload = $request->validated();
        $payload['role'] = 'instructor';
        $payload['password'] = Hash::make($payload['password']);

        $instructor = User::create($payload);

        return (new UserResource($instructor->load([
            'unit:id,name,code',
            'teachingCourses' => function ($query) {
                $query->select('id', 'title', 'status', 'slug', 'instructor_id')->withCount('enrollments');
            },
        ])))->response()->setStatusCode(201);
    }

    public function show(User $instructor): UserResource
    {
        abort_unless($instructor->role === 'instructor', 404);

        $instructor->loadCount('teachingCourses')
            ->load([
                'unit:id,name,code',
                'teachingCourses' => function ($query) {
                    $query->select('id', 'title', 'status', 'slug', 'instructor_id')
                        ->withCount('enrollments');
                },
            ]);

        return new UserResource($instructor);
    }

    public function update(UpdateInstructorRequest $request, User $instructor): UserResource
    {
        abort_unless($instructor->role === 'instructor', 404);

        $payload = $request->validated();

        if (! empty($payload['password'])) {
            $payload['password'] = Hash::make($payload['password']);
        } else {
            unset($payload['password']);
        }

        $instructor->update($payload);

        return new UserResource($instructor->refresh()->load([
            'unit:id,name,code',
        ])->loadCount('teachingCourses'));
    }

    public function destroy(User $instructor): JsonResponse
    {
        abort_unless($instructor->role === 'instructor', 404);

        $instructor->delete();

        return response()->json(null, 204);
    }
}
