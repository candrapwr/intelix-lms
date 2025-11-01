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

export default function StudentCoursesPage() {
    const { pushError } = useNotification();

    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [detailLoading, setDetailLoading] = useState(false);
    const [selectedCourse, setSelectedCourse] = useState(null);

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
                setSelectedCourse(response.data.data ?? response.data ?? null);
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

    const materialsTotal = useMemo(() => {
        if (!selectedCourse?.sections) return 0;
        return selectedCourse.sections.reduce(
            (total, section) => total + (section.materials?.length ?? 0),
            0,
        );
    }, [selectedCourse]);

    return (
        <div className="student-page">
            <section className="section-header">
                <div>
                    <h1>Kursus Saya</h1>
                    <p>Kelola misi belajar yang sudah Anda ikuti dan akses materi tiap section.</p>
                </div>
            </section>

            <div className="my-course-layout">
                <div className="my-course-list">
                    {loading ? (
                        <div className="empty-state">
                            <h2>Memuat kursus...</h2>
                            <p>Menyiapkan daftar kursus yang sedang Anda ikuti.</p>
                        </div>
                    ) : courses.length === 0 ? (
                        <div className="empty-state">
                            <h2>Belum ada kursus yang diikuti</h2>
                            <p>Pergi ke dashboard untuk memilih dan mendaftar kursus baru.</p>
                        </div>
                    ) : (
                        <ul>
                            {courses.map((course) => {
                                const isActive = selectedCourse?.slug === course.slug;
                                const progress = course.enrollment?.progress_percentage ?? 0;

                                return (
                                    <li key={course.id}>
                                        <button
                                            type="button"
                                            className={`my-course-item${isActive ? ' active' : ''}`}
                                            onClick={() => fetchCourseDetail(course.slug)}
                                        >
                                            <div className="item-heading">
                                                <span className="badge accent">
                                                    {course.classification?.name ?? 'Umum'}
                                                </span>
                                                <strong>{course.title}</strong>
                                            </div>
                                            <p>{course.short_description ?? 'Belum ada ringkasan kursus.'}</p>
                                            <div className="item-footer">
                                                <span>{progress}% progres</span>
                                                {course.enrollment?.last_accessed_at ? (
                                                    <span>
                                                        Akses terakhir {formatDateTime(course.enrollment.last_accessed_at)}
                                                    </span>
                                                ) : null}
                                            </div>
                                        </button>
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </div>

                <div className="my-course-detail">
                    {detailLoading ? (
                        <div className="empty-state">
                            <h2>Memuat materi...</h2>
                            <p>Menyiapkan struktur section dan materi kursus.</p>
                        </div>
                    ) : !selectedCourse ? (
                        <div className="empty-state">
                            <h2>Pilih kursus</h2>
                            <p>Pilih salah satu kursus di sisi kiri untuk melihat detail materinya.</p>
                        </div>
                    ) : (
                        <div className="course-detail-card">
                            <header>
                                <div>
                                    <span className="badge primary">
                                        {selectedCourse.classification?.name ?? 'Umum'}
                                    </span>
                                    <h2>{selectedCourse.title}</h2>
                                </div>
                                <div className="detail-stats">
                                    <span>{selectedCourse.sections?.length ?? 0} section</span>
                                    <span>{materialsTotal} materi</span>
                                    {selectedCourse.enrollment?.enrolled_at ? (
                                        <span>
                                            Bergabung {formatDateTime(selectedCourse.enrollment.enrolled_at)}
                                        </span>
                                    ) : null}
                                </div>
                            </header>
                            <div
                                className="detail-description"
                                dangerouslySetInnerHTML={{
                                    __html:
                                        sanitizeHtml(selectedCourse.description) ||
                                        '<p>Belum ada deskripsi lengkap.</p>',
                                }}
                            />

                            {selectedCourse.sections?.length ? (
                                <div className="section-list">
                                    {selectedCourse.sections.map((section) => (
                                        <div key={section.id} className="section-card">
                                            <div className="section-header-row">
                                                <div>
                                                    <h3>{section.title}</h3>
                                                    <p>{section.summary ?? 'Belum ada ringkasan section.'}</p>
                                                </div>
                                                {section.sort_order !== null && section.sort_order !== undefined ? (
                                                    <span className="badge soft">Urutan {section.sort_order}</span>
                                                ) : null}
                                            </div>
                                            {section.materials?.length ? (
                                                <ul className="material-list">
                                                    {section.materials.map((material) => (
                                                        <li key={material.id}>
                                                            <div>
                                                                <strong>{material.title ?? material.file_name}</strong>
                                                                <p>
                                                                    {material.description ??
                                                                        'Belum ada deskripsi materi.'}
                                                                </p>
                                                            </div>
                                                            {material.file_url ? (
                                                                <a
                                                                    href={material.file_url}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                >
                                                                    Unduh
                                                                </a>
                                                            ) : null}
                                                        </li>
                                                    ))}
                                                </ul>
                                            ) : (
                                                <div className="empty-material">Belum ada materi.</div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="empty-state">
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
