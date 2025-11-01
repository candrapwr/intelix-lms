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
