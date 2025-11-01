import { useCallback, useEffect, useMemo, useState } from 'react';
import studentClient from '../../api/studentClient';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import './student.css';

function formatDuration(minutes) {
    if (!minutes || Number.isNaN(Number(minutes))) {
        return 'Durasi fleksibel';
    }

    const hours = Math.floor(minutes / 60);
    const rest = minutes % 60;

    if (!hours) {
        return `${minutes} menit`;
    }

    if (!rest) {
        return `${hours} jam`;
    }

    return `${hours} jam ${rest} menit`;
}

export default function StudentHomePage() {
    const { user } = useAuth();
    const { pushError, pushSuccess } = useNotification();

    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [enrollingSlug, setEnrollingSlug] = useState(null);

    const fetchCourses = useCallback(async () => {
        setLoading(true);
        try {
            const response = await studentClient.get('/courses');
            setCourses(response.data.data ?? response.data ?? []);
        } catch (error) {
            pushError('Gagal memuat kursus', error.response?.data?.message ?? error.message);
        } finally {
            setLoading(false);
        }
    }, [pushError]);

    useEffect(() => {
        fetchCourses();
    }, [fetchCourses]);

    const handleEnroll = useCallback(
        async (course) => {
            if (!course || course.is_enrolled) {
                return;
            }

            try {
                setEnrollingSlug(course.slug);
                const response = await studentClient.post(`/courses/${course.slug}/enroll`);
                const updated = response.data.data ?? response.data;

                setCourses((prev) =>
                    prev.map((item) => (item.id === updated.id ? { ...item, ...updated } : item)),
                );

                pushSuccess('Berhasil daftar kursus', `${course.title} siap dipelajari.`);
            } catch (error) {
                pushError('Pendaftaran gagal', error.response?.data?.message ?? error.message);
            } finally {
                setEnrollingSlug(null);
            }
        },
        [pushError, pushSuccess],
    );

    const enrolledCount = useMemo(
        () => courses.filter((course) => course.is_enrolled).length,
        [courses],
    );

    const headline = useMemo(() => {
        const name = user?.name ?? 'Operative';
        const firstName = name.split(' ')[0];
        return `Halo, ${firstName}!`;
    }, [user]);

    return (
        <div className="student-page">
            <section className="hero-banner">
                <div>
                    <h1>{headline}</h1>
                    <p>
                        Pilih kursus intelijen yang tersedia dan tingkatkan kemampuan operasional Anda
                        secara bertahap. Semua materi telah dikurasi oleh mentor lapangan terbaik.
                    </p>
                </div>
                <div className="hero-progress">
                    <span className="progress-label">TOTAL KURSUS DIIKUTI</span>
                    <span className="progress-value">{enrolledCount}</span>
                    <span className="badge primary">Aktivitas terbaru</span>
                </div>
            </section>

            <section className="timeline-card">
                <header>
                    <div>
                        <h2>Katalog Kursus</h2>
                        <p>
                            Temukan misi pembelajaran baru dan daftar untuk mulai mempelajari materi
                            intelijen.
                        </p>
                    </div>
                </header>

                {loading ? (
                    <div className="empty-state">
                        <h2>Memuat kursus...</h2>
                        <p>Intel kursus sedang dipersiapkan. Mohon menunggu sejenak.</p>
                    </div>
                ) : courses.length === 0 ? (
                    <div className="empty-state">
                        <h2>Belum ada kursus publik</h2>
                        <p>
                            Hubungi admin untuk mendapatkan akses kursus atau tunggu kurasi misi baru.
                        </p>
                    </div>
                ) : (
                    <ul className="course-list">
                        {courses.map((course) => (
                            <li key={course.id} className="course-card">
                                <div className="course-card__meta">
                                    <span className="badge accent">
                                        {course.classification?.name ?? 'Umum'}
                                    </span>
                                    <h3>{course.title}</h3>
                                    <p>{course.short_description ?? 'Belum ada ringkasan kursus.'}</p>
                                    <div className="course-card__info">
                                        <span>{formatDuration(course.duration_minutes)}</span>
                                        {course.sections_count ? (
                                            <span>{course.sections_count} section</span>
                                        ) : null}
                                        {course.modules_count ? (
                                            <span>{course.modules_count} modul</span>
                                        ) : null}
                                    </div>
                                </div>
                                <div className="course-card__actions">
                                    {course.is_enrolled ? (
                                        <span className="badge soft">Sudah diikuti</span>
                                    ) : (
                                        <button
                                            type="button"
                                            className="primary-button"
                                            onClick={() => handleEnroll(course)}
                                            disabled={enrollingSlug === course.slug}
                                        >
                                            {enrollingSlug === course.slug ? 'Mendaftar...' : 'Daftar Kursus'}
                                        </button>
                                    )}
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </section>
        </div>
    );
}
