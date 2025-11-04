<?php

namespace App\Http\Controllers\Instructor;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreCourseQuizRequest;
use App\Http\Requests\Admin\UpdateCourseQuizRequest;
use App\Http\Resources\CourseQuizResource;
use App\Models\CourseQuiz;
use App\Models\CourseSection;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class InstructorCourseQuizController extends Controller
{
    public function store(StoreCourseQuizRequest $request, CourseSection $section): JsonResponse
    {
        $instructor = $request->user();

        abort_unless($instructor && $instructor->role === 'instructor', 403);
        $this->ensureSectionOwnership($section, $instructor->id);

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

    public function update(UpdateCourseQuizRequest $request, CourseQuiz $quiz): CourseQuizResource
    {
        $instructor = $request->user();

        abort_unless($instructor && $instructor->role === 'instructor', 403);
        $this->ensureQuizOwnership($quiz, $instructor->id);

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

    public function destroy(Request $request, CourseQuiz $quiz): JsonResponse
    {
        $instructor = $request->user();

        abort_unless($instructor && $instructor->role === 'instructor', 403);
        $this->ensureQuizOwnership($quiz, $instructor->id);

        $quiz->delete();

        return response()->json(null, 204);
    }

    private function ensureSectionOwnership(CourseSection $section, int $instructorId): void
    {
        $section->loadMissing('course');

        abort_unless(optional($section->course)->instructor_id === $instructorId, 404);
    }

    private function ensureQuizOwnership(CourseQuiz $quiz, int $instructorId): void
    {
        $quiz->loadMissing('section.course');

        abort_unless(optional(optional($quiz->section)->course)->instructor_id === $instructorId, 404);
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

