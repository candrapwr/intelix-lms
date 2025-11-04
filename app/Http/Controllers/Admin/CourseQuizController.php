<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreCourseQuizRequest;
use App\Http\Requests\Admin\UpdateCourseQuizRequest;
use App\Http\Resources\CourseQuizResource;
use App\Models\CourseQuiz;
use App\Models\CourseSection;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\ResourceCollection;
use Illuminate\Support\Facades\DB;

class CourseQuizController extends Controller
{
    public function index(CourseSection $section): ResourceCollection
    {
        $quizzes = $section->quizzes()
            ->with('options')
            ->orderBy('sort_order')
            ->orderBy('created_at')
            ->get();

        return CourseQuizResource::collection($quizzes);
    }

    public function store(StoreCourseQuizRequest $request, CourseSection $section): JsonResponse
    {
        $payload = $request->validated();

        $quiz = DB::transaction(function () use ($section, $payload): CourseQuiz {
            $sortOrder = array_key_exists('sort_order', $payload) && $payload['sort_order'] !== null
                ? (int) $payload['sort_order']
                : (int) $section->quizzes()->max('sort_order') + 1;

            $quiz = $section->quizzes()->create([
                'question' => $payload['question'],
                'explanation' => $payload['explanation'] ?? null,
                'sort_order' => $sortOrder,
            ]);

            $this->syncQuizOptions($quiz, $payload['options']);

            return $quiz;
        });

        return (new CourseQuizResource($quiz->load('options')))
            ->response()
            ->setStatusCode(201);
    }

    public function show(CourseQuiz $quiz): CourseQuizResource
    {
        return new CourseQuizResource($quiz->load('options'));
    }

    public function update(UpdateCourseQuizRequest $request, CourseQuiz $quiz): CourseQuizResource
    {
        $payload = $request->validated();

        DB::transaction(function () use ($quiz, $payload): void {
            if (array_key_exists('question', $payload)) {
                $quiz->question = $payload['question'];
            }

            if (array_key_exists('explanation', $payload)) {
                $quiz->explanation = $payload['explanation'];
            }

            if (array_key_exists('sort_order', $payload)) {
                $quiz->sort_order = $payload['sort_order'] !== null ? (int) $payload['sort_order'] : null;
            }

            $quiz->save();

            if (array_key_exists('options', $payload)) {
                $this->syncQuizOptions($quiz, $payload['options']);
            }
        });

        return new CourseQuizResource($quiz->refresh()->load('options'));
    }

    public function destroy(CourseQuiz $quiz): JsonResponse
    {
        $quiz->delete();

        return response()->json(null, 204);
    }

    /**
     * @param  array<int, array<string, mixed>>  $options
     */
    private function syncQuizOptions(CourseQuiz $quiz, array $options): void
    {
        $quiz->options()->delete();

        $formatted = collect($options)->values()->map(function (array $option, int $index): array {
            return [
                'label' => $option['label'] ?? chr(65 + $index),
                'text' => $option['text'],
                'is_correct' => ($option['is_correct'] ?? false) === true,
            ];
        });

        $quiz->options()->createMany($formatted->all());
    }
}

