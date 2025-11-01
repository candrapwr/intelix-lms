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

function CourseCard({ course, onEnroll, enrollingSlug }) {
    const getCategoryColor = (category) => {
        const colors = {
            'Operasi': 'var(--category-operasi)',
            'Analisis': 'var(--category-analisis)', 
            'Teknis': 'var(--category-teknis)',
            'Strategi': 'var(--category-strategi)',
            'Umum': 'var(--category-umum)'
        };
        return colors[category] || colors['Umum'];
    };

    return (
        <div className="course-card-compact">
            <div className="course-card__header">
                <div 
                    className="course-category-badge"
                    style={{ backgroundColor: getCategoryColor(course.classification?.name) }}
                >
                    {course.classification?.name ?? 'Umum'}
                </div>
                <div className="course-meta-icons">
                    {course.sections_count > 0 && (
                        <span className="meta-icon">
                            📚 {course.sections_count}
                        </span>
                    )}
                </div>
            </div>
            
            <div className="course-card__content">
                <h3 className="course-title">{course.title}</h3>
                <p className="course-description">
                    {course.short_description ?? 'Belum ada ringkasan kursus.'}
                </p>
                
                <div className="course-stats">
                    <div className="stat-item">
                        <span className="stat-icon">⏱️</span>
                        <span>{formatDuration(course.duration_minutes)}</span>
                    </div>
                    {course.enrollments_count > 0 && (
                        <div className="stat-item">
                            <span className="stat-icon">👥</span>
                            <span>{course.enrollments_count}</span>
                        </div>
                    )}
                </div>
            </div>
            
            <div className="course-card__footer">
                {course.is_enrolled ? (
                    <div className="enrolled-status">
                        <span className="status-badge enrolled">✓ Sudah Diikuti</span>
                    </div>
                ) : (
                    <button
                        className="primary-button compact full-width"
                        onClick={() => onEnroll(course)}
                        disabled={enrollingSlug === course.slug}
                    >
                        {enrollingSlug === course.slug ? (
                            <>
                                <span className="loading-spinner small"></span>
                                Mendaftar...
                            </>
                        ) : (
                            <>
                                <span className="button-icon">🎯</span>
                                Daftar
                            </>
                        )}
                    </button>
                )}
            </div>
        </div>
    );
}

export default function StudentHomePage() {
    const { user } = useAuth();
    const { pushError, pushSuccess } = useNotification();

    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [enrollingSlug, setEnrollingSlug] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');

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

    const categories = useMemo(() => {
        const uniqueCategories = [...new Set(courses.map(course => course.classification?.name || 'Umum'))];
        return ['all', ...uniqueCategories];
    }, [courses]);

    const filteredCourses = useMemo(() => {
        return courses.filter(course => {
            const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                course.short_description?.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesCategory = selectedCategory === 'all' || 
                                  course.classification?.name === selectedCategory ||
                                  (!course.classification?.name && selectedCategory === 'Umum');
            return matchesSearch && matchesCategory;
        });
    }, [courses, searchTerm, selectedCategory]);

    return (
        <div className="student-dashboard-compact">
            {/* Hero Section */}
            <section className="dashboard-hero-compact">
                <div className="hero-content-compact">
                    <div className="hero-text-compact">
                        <h1 className="hero-title-compact">{headline}</h1>
                        <p className="hero-subtitle-compact">
                            Tingkatkan kemampuan operasional dengan kursus intelijen terkurasi
                        </p>
                    </div>
                    <div className="hero-stats-compact">
                        <div className="stat-card-compact">
                            <div className="stat-value-compact">{enrolledCount}</div>
                            <div className="stat-label-compact">Kursus Diikuti</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Catalog Section */}
            <section className="catalog-section-compact">
                <div className="catalog-header-compact">
                    <div className="header-content-compact">
                        <h2 className="section-title-compact">Katalog Kursus</h2>
                        <p className="section-subtitle-compact">
                            Temukan dan daftar kursus untuk mengembangkan kemampuan Anda
                        </p>
                    </div>
                    
                    {/* Search and Filter */}
                    <div className="catalog-controls-compact">
                        <div className="search-box-compact">
                            <span className="search-icon">🔍</span>
                            <input
                                type="text"
                                placeholder="Cari kursus..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="search-input-compact"
                            />
                        </div>
                        
                        <div className="filter-group-compact">
                            <select 
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                                className="category-filter-compact"
                            >
                                <option value="all">Semua Kategori</option>
                                {categories.filter(cat => cat !== 'all').map(category => (
                                    <option key={category} value={category}>
                                        {category}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Course Grid */}
                {loading ? (
                    <div className="loading-state-compact">
                        <div className="loading-spinner medium"></div>
                        <h3>Memuat kursus...</h3>
                    </div>
                ) : filteredCourses.length === 0 ? (
                    <div className="empty-state-compact">
                        <div className="empty-icon">📚</div>
                        <h3>Tidak ada kursus yang cocok</h3>
                        <p>
                            {searchTerm || selectedCategory !== 'all' 
                                ? 'Coba ubah pencarian atau filter kategori Anda'
                                : 'Belum ada kursus publik tersedia'
                            }
                        </p>
                    </div>
                ) : (
                    <div className="course-grid-compact">
                        {filteredCourses.map((course) => (
                            <CourseCard
                                key={course.id}
                                course={course}
                                onEnroll={handleEnroll}
                                enrollingSlug={enrollingSlug}
                            />
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}