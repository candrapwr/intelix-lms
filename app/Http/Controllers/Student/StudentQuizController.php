<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Http\Requests\Student\SubmitSectionQuizRequest;
use App\Http\Resources\CourseQuizAttemptResource;
use App\Models\CourseQuiz;
use App\Models\CourseQuizAttempt;
use App\Models\CourseQuizAttemptAnswer;
use App\Models\CourseQuizOption;
use App\Models\CourseSection;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class StudentQuizController extends Controller
{
    public function submit(SubmitSectionQuizRequest $request, CourseSection $section): JsonResponse
    {
        $student = $request->user();

        abort_unless($student && $student->role === 'student', 403);

        $section->loadMissing('course');
        $course = $section->course;

        abort_unless($course, 404, 'Kursus tidak ditemukan.');

        $isEnrolled = $course->enrollments()
            ->where('user_id', $student->id)
            ->exists();

        abort_unless($isEnrolled, 404, 'Anda belum terdaftar pada kursus ini.');

        $existingAttempt = CourseQuizAttempt::query()
            ->where('user_id', $student->id)
            ->where('course_section_id', $section->id)
            ->first();

        if ($existingAttempt) {
            return (new CourseQuizAttemptResource($existingAttempt->load('answers')))
                ->response()
                ->setStatusCode(409);
        }

        $answersPayload = collect($request->validated('answers', []))
            ->map(fn ($answer) => [
                'quiz_id' => (int) $answer['quiz_id'],
                'option_id' => (int) $answer['option_id'],
            ]);

        $quizzes = CourseQuiz::query()
            ->whereIn('id', $answersPayload->pluck('quiz_id')->all())
            ->with('section')
            ->get()
            ->keyBy('id');

        if ($quizzes->isEmpty()) {
            abort(422, 'Tidak ada kuis yang dapat diproses.');
        }

        $sectionQuizIds = $section->quizzes()->pluck('id')->all();

        $missingQuiz = $answersPayload->first(fn ($answer) => ! in_array($answer['quiz_id'], $sectionQuizIds, true));

        if ($missingQuiz) {
            abort(422, 'Terdapat jawaban yang tidak sesuai dengan kuis pada section ini.');
        }

        $expectedQuizCount = count($sectionQuizIds);
        if ($answersPayload->count() !== $expectedQuizCount) {
            abort(422, 'Jawablah seluruh pertanyaan sebelum menyelesaikan kuis.');
        }

        $options = CourseQuizOption::query()
            ->whereIn('id', $answersPayload->pluck('option_id')->all())
            ->get()
            ->keyBy('id');

        $missingOption = $answersPayload->first(fn ($answer) => ! $options->has($answer['option_id']));

        if ($missingOption) {
            abort(422, 'Pilihan jawaban tidak valid.');
        }

        $evaluation = DB::transaction(function () use ($answersPayload, $section, $student, $course, $options): CourseQuizAttempt {
            $attempt = CourseQuizAttempt::create([
                'user_id' => $student->id,
                'course_id' => $course->id,
                'course_section_id' => $section->id,
                'total_questions' => $answersPayload->count(),
                'correct_answers' => 0,
                'submitted_at' => now(),
            ]);

            $answers = [];
            $correctCount = 0;

            foreach ($answersPayload as $answer) {
                $option = $options[$answer['option_id']];

                if ((int) $option->course_quiz_id !== $answer['quiz_id']) {
                    abort(422, 'Pilihan jawaban tidak sesuai dengan kuis.');
                }
                $isCorrect = (bool) $option->is_correct;

                if ($isCorrect) {
                    $correctCount++;
                }

                $answers[] = [
                    'course_quiz_attempt_id' => $attempt->id,
                    'course_quiz_id' => $answer['quiz_id'],
                    'course_quiz_option_id' => $option->id,
                    'is_correct' => $isCorrect,
                    'created_at' => now(),
                    'updated_at' => now(),
                ];
            }

            CourseQuizAttemptAnswer::insert($answers);

            $attempt->forceFill([
                'correct_answers' => $correctCount,
            ])->save();

            return $attempt->load('answers');
        });

        return (new CourseQuizAttemptResource($evaluation))
            ->additional([
                'section_id' => $section->id,
                'message' => "Kuis diselesaikan. Anda menjawab {$evaluation->correct_answers} dari {$evaluation->total_questions} soal dengan benar.",
            ])
            ->response()
            ->setStatusCode(201);
    }
}
