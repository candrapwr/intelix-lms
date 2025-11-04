import { useCallback, useEffect, useMemo, useState } from 'react';
import studentClient from '../../api/studentClient';
import { useNotification } from '../../context/NotificationContext';
import './student.css';

function formatDateTime(value) {
    if (!value) return null;
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return null;
    return date.toLocaleString();
}

function sanitizeHtml(value) {
    if (!value || typeof value !== 'string') {
        return '';
    }

    return value
        .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '')
        .replace(/on[a-z]+="[^"]*"/gi, '')
        .replace(/on[a-z]+='[^']*'/gi, '');
}

function getCategoryColor(category) {
    const colors = {
        'Operasi': 'var(--category-operasi)',
        'Analisis': 'var(--category-analisis)', 
        'Teknis': 'var(--category-teknis)',
        'Strategi': 'var(--category-strategi)',
        'Umum': 'var(--category-umum)'
    };
    return colors[category] || colors['Umum'];
}

export default function StudentCoursesPage() {
    const { pushError, pushSuccess } = useNotification();

    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [detailLoading, setDetailLoading] = useState(false);
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [quizResponses, setQuizResponses] = useState({});
    const [sectionSubmissions, setSectionSubmissions] = useState({});
    const [submittingSectionId, setSubmittingSectionId] = useState(null);

    const fetchCourseDetail = useCallback(
        async (slug, showLoader = true) => {
            if (!slug) {
                setSelectedCourse(null);
                return;
            }

            if (showLoader) {
                setDetailLoading(true);
            }

            try {
                const response = await studentClient.get(`/my-courses/${slug}`);
                const detail = response.data.data ?? response.data ?? null;
                setSelectedCourse(detail);
                setQuizResponses({});
            } catch (error) {
                pushError('Gagal memuat detail kursus', error.response?.data?.message ?? error.message);
            } finally {
                if (showLoader) {
                    setDetailLoading(false);
                }
            }
        },
        [pushError],
    );

    const fetchCourses = useCallback(async () => {
        setLoading(true);
        try {
            const response = await studentClient.get('/my-courses');
            const fetched = response.data.data ?? response.data ?? [];
            setCourses(fetched);

            if (fetched.length > 0) {
                fetchCourseDetail(fetched[0].slug, false);
            } else {
                setSelectedCourse(null);
            }
        } catch (error) {
            pushError('Gagal memuat kursus', error.response?.data?.message ?? error.message);
        } finally {
            setLoading(false);
        }
    }, [fetchCourseDetail, pushError]);

    useEffect(() => {
        fetchCourses();
    }, [fetchCourses]);

    useEffect(() => {
        if (!selectedCourse) {
            setQuizResponses({});
            setSectionSubmissions({});
            return;
        }

        const initialResponses = {};
        const submissions = {};

        (selectedCourse.sections ?? []).forEach((section) => {
            const attempt = section.quiz_attempt;

            if (!attempt) {
                return;
            }

            submissions[section.id] = true;

            (attempt.answers ?? []).forEach((answer) => {
                initialResponses[answer.course_quiz_id] = {
                    selectedOptionId: answer.course_quiz_option_id,
                    selectedIndex: undefined,
                    checked: true,
                    isCorrect: answer.is_correct,
                };
            });
        });

        setQuizResponses(initialResponses);
        setSectionSubmissions(submissions);
    }, [selectedCourse]);

    const materialsTotal = useMemo(() => {
        if (!selectedCourse?.sections) return 0;
        return selectedCourse.sections.reduce(
            (total, section) => total + (section.materials?.length ?? 0),
            0,
        );
    }, [selectedCourse]);

    const quizzesTotal = useMemo(() => {
        if (!selectedCourse?.sections) return 0;
        return selectedCourse.sections.reduce(
            (total, section) => total + (section.quizzes?.length ?? 0),
            0,
        );
    }, [selectedCourse]);

    const handleSelectQuizOption = (sectionId, quizId, optionId, optionIndex) => {
        setQuizResponses((prev) => ({
            ...prev,
            [quizId]: {
                ...(prev[quizId] ?? {}),
                selectedOptionId: optionId,
                selectedIndex: optionIndex,
                checked: false,
                isCorrect: null,
            },
        }));

        setSectionSubmissions((prev) => ({
            ...prev,
            [sectionId]: false,
        }));
    };

    const handleSubmitSectionQuizzes = async (section) => {
        if (!section?.quizzes?.length) {
            return;
        }

        const unanswered = section.quizzes.filter((quiz) => {
            const response = quizResponses[quiz.id];
            if (!response) return true;
            return (
                response.selectedOptionId === undefined &&
                response.selectedIndex === undefined
            );
        });

        if (unanswered.length > 0) {
            pushError(
                'Lengkapi jawaban',
                'Silakan jawab semua pertanyaan sebelum menyelesaikan kuis.',
            );
            return;
        }

        const answersPayload = [];

        try {
            section.quizzes.forEach((quiz) => {
                const response = quizResponses[quiz.id] ?? {};
                let optionId = response.selectedOptionId;

                if (
                    (optionId === undefined || optionId === null) &&
                    response.selectedIndex !== undefined &&
                    response.selectedIndex !== null
                ) {
                    const optionFromIndex = quiz.options?.[response.selectedIndex];
                    optionId = optionFromIndex?.id;
                }

                if (optionId === undefined || optionId === null) {
                    throw new Error('UNANSWERED');
                }

                answersPayload.push({
                    quiz_id: quiz.id,
                    option_id: optionId,
                });
            });
        } catch (_error) {
            pushError('Jawaban tidak lengkap', 'Terdapat jawaban yang belum dipilih.');
            return;
        }

        if (typeof window !== 'undefined') {
            const confirmed = window.confirm(
                'Selesaikan kuis sekarang? Jawaban akan disimpan permanen dan tidak dapat diubah.',
            );

            if (!confirmed) {
                return;
            }
        }

        try {
            setSubmittingSectionId(section.id);

            const response = await studentClient.post(`/sections/${section.id}/quizzes/submit`, {
                answers: answersPayload,
            });

            const payload = response.data ?? {};
            const attempt = payload.data ?? payload;
            const attemptAnswers = attempt.answers ?? [];

            setQuizResponses((prev) => {
                const next = { ...prev };
                attemptAnswers.forEach((answer) => {
                    next[answer.course_quiz_id] = {
                        selectedOptionId: answer.course_quiz_option_id,
                        selectedIndex: undefined,
                        checked: true,
                        isCorrect: answer.is_correct,
                    };
                });
                return next;
            });

            setSectionSubmissions((prev) => ({
                ...prev,
                [section.id]: true,
            }));

            if (selectedCourse?.slug) {
                await fetchCourseDetail(selectedCourse.slug, false);
            }

            const totalQuestions = attempt.total_questions ?? section.quizzes.length;
            const correctAnswers = attempt.correct_answers ?? 0;
            const message =
                payload.message ??
                `Anda menjawab ${correctAnswers} dari ${totalQuestions} soal dengan benar.`;

            pushSuccess('Kuis diselesaikan', message);
        } catch (error) {
            if (error.response?.status === 409) {
                const payload = error.response.data ?? {};
                const attempt = payload.data ?? payload;
                const attemptAnswers = attempt.answers ?? [];

                setQuizResponses((prev) => {
                    const next = { ...prev };
                    attemptAnswers.forEach((answer) => {
                        next[answer.course_quiz_id] = {
                            selectedOptionId: answer.course_quiz_option_id,
                            selectedIndex: undefined,
                            checked: true,
                            isCorrect: answer.is_correct,
                        };
                    });
                    return next;
                });

                setSectionSubmissions((prev) => ({
                    ...prev,
                    [section.id]: true,
                }));

                const totalQuestions = attempt.total_questions ?? section.quizzes.length;
                const correctAnswers = attempt.correct_answers ?? 0;
                pushError(
                    'Kuis sudah diselesaikan',
                    `Anda sebelumnya menjawab ${correctAnswers} dari ${totalQuestions} soal dengan benar.`,
                );
                return;
            }

            pushError(
                'Gagal menyelesaikan kuis',
                error.response?.data?.message ?? error.message ?? 'Terjadi kesalahan.',
            );
        } finally {
            setSubmittingSectionId(null);
        }
    };

    return (
        <div className="student-dashboard-compact">
            <section className="dashboard-hero-compact">
                <div className="hero-content-compact">
                    <div className="hero-text-compact">
                        <h1 className="hero-title-compact">Kursus Saya</h1>
                        <p className="hero-subtitle-compact">
                            Kelola misi belajar yang sudah Anda ikuti dan akses materi tiap section
                        </p>
                    </div>
                    <div className="hero-stats-compact">
                        <div className="stat-card-compact">
                            <div className="stat-value-compact">{courses.length}</div>
                            <div className="stat-label-compact">Kursus</div>
                        </div>
                    </div>
                </div>
            </section>

            <div className="my-course-layout-compact">
                <div className="my-course-list-compact">
                    {loading ? (
                        <div className="loading-state-compact">
                            <div className="loading-spinner medium"></div>
                            <h3>Memuat kursus...</h3>
                        </div>
                    ) : courses.length === 0 ? (
                        <div className="empty-state-compact">
                            <div className="empty-icon">📚</div>
                            <h3>Belum ada kursus yang diikuti</h3>
                            <p>Pergi ke dashboard untuk memilih dan mendaftar kursus baru.</p>
                        </div>
                    ) : (
                        <div className="course-list-compact">
                            {courses.map((course) => {
                                const isActive = selectedCourse?.slug === course.slug;
                                const progress = course.enrollment?.progress_percentage ?? 0;

                                return (
                                    <button
                                        key={course.id}
                                        type="button"
                                        className={`course-item-compact${isActive ? ' active' : ''}`}
                                        onClick={() => fetchCourseDetail(course.slug)}
                                    >
                                        <div className="course-item-header">
                                            <div 
                                                className="course-category-badge"
                                                style={{ 
                                                    backgroundColor: getCategoryColor(course.classification?.name)
                                                }}
                                            >
                                                {course.classification?.name ?? 'Umum'}
                                            </div>
                                            <div className="progress-indicator">
                                                <span className="progress-badge">{progress}%</span>
                                            </div>
                                        </div>
                                        <h4 className="course-item-title">{course.title}</h4>
                                        <p className="course-item-description">
                                            {course.short_description ?? 'Belum ada ringkasan kursus.'}
                                        </p>
                                        <div className="course-item-footer">
                                            {course.enrollment?.last_accessed_at ? (
                                                <span className="last-access">
                                                    Akses terakhir {formatDateTime(course.enrollment.last_accessed_at)}
                                                </span>
                                            ) : null}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>

                <div className="my-course-detail-compact">
                    {detailLoading ? (
                        <div className="loading-state-compact">
                            <div className="loading-spinner medium"></div>
                            <h3>Memuat materi...</h3>
                        </div>
                    ) : !selectedCourse ? (
                        <div className="empty-state-compact">
                            <div className="empty-icon">🎯</div>
                            <h3>Pilih kursus</h3>
                            <p>Pilih salah satu kursus di sisi kiri untuk melihat detail materinya.</p>
                        </div>
                    ) : (
                        <div className="course-detail-card-compact">
                            <header>
                                <div className="detail-header-main">
                                    <div 
                                        className="course-category-badge"
                                        style={{ 
                                            backgroundColor: getCategoryColor(selectedCourse.classification?.name)
                                        }}
                                    >
                                        {selectedCourse.classification?.name ?? 'Umum'}
                                    </div>
                                    <h2 className="detail-title">{selectedCourse.title}</h2>
                                </div>
                                <div className="detail-stats-compact">
                                    <div className="stat-item">
                                        <span className="stat-icon">📚</span>
                                        <span>{selectedCourse.sections?.length ?? 0} section</span>
                                    </div>
                                    <div className="stat-item">
                                        <span className="stat-icon">📄</span>
                                        <span>{materialsTotal} materi</span>
                                    </div>
                                    <div className="stat-item">
                                        <span className="stat-icon">📝</span>
                                        <span>{quizzesTotal} kuis</span>
                                    </div>
                                    {selectedCourse.enrollment?.enrolled_at ? (
                                        <div className="stat-item">
                                            <span className="stat-icon">📅</span>
                                            <span>Bergabung {formatDateTime(selectedCourse.enrollment.enrolled_at)}</span>
                                        </div>
                                    ) : null}
                                </div>
                            </header>
                            <div
                                className="detail-description-compact"
                                dangerouslySetInnerHTML={{
                                    __html:
                                        sanitizeHtml(selectedCourse.description) ||
                                        '<p>Belum ada deskripsi lengkap.</p>',
                                }}
                            />

                            {selectedCourse.sections?.length ? (
                                <div className="section-list-compact">
                                    {selectedCourse.sections.map((section) => (
                                        <div key={section.id} className="section-card-compact">
                                            <div className="section-header-compact">
                                                <div>
                                                    <h3 className="section-title">{section.title}</h3>
                                                    <p className="section-summary">{section.summary ?? 'Belum ada ringkasan section.'}</p>
                                                </div>
                                                {section.sort_order !== null && section.sort_order !== undefined ? (
                                                    <span className="order-badge">Urutan {section.sort_order}</span>
                                                ) : null}
                                            </div>
                                            {section.materials?.length ? (
                                                <ul className="material-list-compact">
                                                    {section.materials.map((material) => (
                                                        <li key={material.id} className="material-item-compact">
                                                            <div className="material-content">
                                                                <strong className="material-title">{material.title ?? material.file_name}</strong>
                                                                <p className="material-description">
                                                                    {material.description ??
                                                                        'Belum ada deskripsi materi.'}
                                                                </p>
                                                            </div>
                                                            {material.file_url ? (
                                                                <a
                                                                    href={material.file_url}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="download-button compact"
                                                                >
                                                                    <span className="button-icon">📥</span>
                                                                    Unduh
                                                                </a>
                                                            ) : null}
                                                        </li>
                                                    ))}
                                                </ul>
                                            ) : (
                                                <div className="empty-material-compact">Belum ada materi.</div>
                                            )}
                                            {section.quizzes?.length ? (() => {
                                                const sectionSubmitted = sectionSubmissions[section.id] === true;
                                                const allAnswered = section.quizzes.every((quiz) => {
                                                    const response = quizResponses[quiz.id];
                                                    if (!response) return false;
                                                    return (
                                                        response.selectedOptionId !== undefined ||
                                                        response.selectedIndex !== undefined
                                                    );
                                                });
                                                const computedCorrectCount = section.quizzes.reduce((total, quiz) => {
                                                    const response = quizResponses[quiz.id];
                                                    if (!response?.isCorrect) {
                                                        return total;
                                                    }
                                                    return total + 1;
                                                }, 0);
                                                const attempt = section.quiz_attempt;
                                                const totalQuestions = attempt?.total_questions ?? section.quizzes.length;
                                                const correctCount = attempt?.correct_answers ?? computedCorrectCount;
                                                const isLocked = sectionSubmitted || submittingSectionId === section.id;

                                                return (
                                                    <div className="quiz-list-compact">
                                                        <div className="quiz-list-header">
                                                            <h4>Latihan Kuis</h4>
                                                        </div>
                                                        {section.quizzes.map((quiz, quizIndex) => {
                                                            const quizState = quizResponses[quiz.id] ?? {};

                                                            return (
                                                                <div key={quiz.id} className="quiz-card-compact">
                                                                    <div className="quiz-header">
                                                                        <div>
                                                                            <div className="quiz-title">
                                                                                {`Kuis ${quizIndex + 1}`}
                                                                                {quiz.sort_order !== null &&
                                                                                quiz.sort_order !== undefined ? (
                                                                                    <span className="order-badge soft">
                                                                                        Urutan {quiz.sort_order}
                                                                                    </span>
                                                                                ) : null}
                                                                            </div>
                                                                            <p className="quiz-question">{quiz.question}</p>
                                                                        </div>
                                                                    </div>
                                                                    {quiz.options?.length ? (
                                                                        <ul className="quiz-options-list">
                                                                            {quiz.options.map((option, optionIndex) => {
                                                                                const hasOptionId =
                                                                                    option?.id !== undefined && option?.id !== null;
                                                                                const isSelected = hasOptionId
                                                                                    ? quizState.selectedOptionId === option.id
                                                                                    : quizState.selectedIndex === optionIndex;
                                                                                const optionClassNames = ['quiz-option-item'];

                                                                                if (isSelected) {
                                                                                    optionClassNames.push('selected');
                                                                                }

                                                                                if (sectionSubmitted && quizState.checked && option.is_correct) {
                                                                                    optionClassNames.push('correct');
                                                                                }

                                                                                if (
                                                                                    sectionSubmitted &&
                                                                                    quizState.checked &&
                                                                                    isSelected &&
                                                                                    !option.is_correct
                                                                                ) {
                                                                                    optionClassNames.push('incorrect');
                                                                                }

                                                                                return (
                                                                                    <li
                                                                                        key={option.id ?? optionIndex}
                                                                                        className={optionClassNames.join(' ')}
                                                                                    >
                                                                                        <label className="quiz-option-label">
                                                                                            <input
                                                                                                type="radio"
                                                                                                name={`quiz-${quiz.id}`}
                                                                                                value={hasOptionId ? option.id : optionIndex}
                                                                                                checked={isSelected}
                                                                                                disabled={isLocked}
                                                                                                onChange={() =>
                                                                                                    handleSelectQuizOption(
                                                                                                        section.id,
                                                                                                        quiz.id,
                                                                                                        hasOptionId ? option.id : optionIndex,
                                                                                                        optionIndex,
                                                                                                    )
                                                                                                }
                                                                                            />
                                                                                            <span className="quiz-option-text">
                                                                                                <span className="quiz-option-letter">
                                                                                                    {String.fromCharCode(65 + optionIndex)}.
                                                                                                </span>
                                                                                                {option.text}
                                                                                            </span>
                                                                                        </label>
                                                                                    </li>
                                                                                );
                                                                            })}
                                                                        </ul>
                                                                    ) : (
                                                                        <div className="empty-quiz-options">
                                                                            Belum ada pilihan jawaban pada kuis ini.
                                                                        </div>
                                                                    )}
                                                                    {sectionSubmitted && quizState.checked ? (
                                                                        <div
                                                                            className={`quiz-feedback ${
                                                                                quizState.isCorrect ? 'correct' : 'incorrect'
                                                                            }`}
                                                                        >
                                                                            <strong>
                                                                                {quizState.isCorrect
                                                                                    ? 'Jawaban benar! 🎉'
                                                                                    : 'Jawaban belum tepat. Pelajari kembali materi.'}
                                                                            </strong>
                                                                            {quiz.explanation ? (
                                                                                <p className="quiz-explanation">
                                                                                    Penjelasan: {quiz.explanation}
                                                                                </p>
                                                                            ) : null}
                                                                        </div>
                                                                    ) : null}
                                                                </div>
                                                            );
                                                        })}
                                                        <div className="quiz-section-actions">
                                                            <button
                                                                type="button"
                                                                className="quiz-submit-button"
                                                                onClick={() => handleSubmitSectionQuizzes(section)}
                                                                disabled={
                                                                    !allAnswered ||
                                                                    sectionSubmitted ||
                                                                    submittingSectionId === section.id
                                                                }
                                                            >
                                                                Selesaikan Kuis
                                                            </button>
                                                            {!allAnswered && !sectionSubmitted ? (
                                                                <p className="quiz-section-hint">
                                                                    Jawab semua pertanyaan untuk melihat evaluasi.
                                                                </p>
                                                            ) : null}
                                                            {sectionSubmitted ? (
                                                                <div className="quiz-summary">
                                                                    <strong>Rekap:</strong>{' '}
                                                                    {correctCount} dari {totalQuestions} jawaban benar.
                                                                </div>
                                                            ) : null}
                                                        </div>
                                                    </div>
                                                );
                                            })() : (
                                                <div className="empty-quiz-compact">
                                                    Belum ada kuis pada section ini.
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="empty-state-compact">
                                    <div className="empty-icon">📚</div>
                                    <h3>Belum ada section</h3>
                                    <p>Kursus ini belum memiliki section yang dapat diakses.</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
