import { useCallback, useEffect, useMemo, useState } from 'react';
import Swal from 'sweetalert2';
import instructorClient from '../../api/instructorClient';
import Modal from '../../components/Modal';
import { useNotification } from '../../context/NotificationContext';
import './instructor.css';

const emptySection = {
    title: '',
    summary: '',
    sort_order: '',
};

const emptyMaterial = {
    title: '',
    description: '',
    sort_order: '',
    file: null,
};

const EditIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" width="20" height="20">
        <path d="M4 21h4l11-11-4-4L4 17v4z" strokeLinejoin="round" />
        <path d="M14 5l4 4" strokeLinecap="round" />
    </svg>
);

const DeleteIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" width="20" height="20">
        <path d="M3 6h18" strokeLinecap="round" />
        <path d="M8 6v-2h8v2" strokeLinecap="round" />
        <path d="M19 6v14H5V6" strokeLinejoin="round" />
        <path d="M10 11v6M14 11v6" strokeLinecap="round" />
    </svg>
);

const PlusIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" width="20" height="20">
        <path d="M12 5v14M5 12h14" strokeLinecap="round" />
    </svg>
);

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

function normalizeSectionPayload(form) {
    return {
        title: form.title,
        summary: form.summary || undefined,
        sort_order:
            form.sort_order === '' || Number.isNaN(Number(form.sort_order))
                ? undefined
                : Number(form.sort_order),
    };
}

function formatFileSize(bytes) {
    if (bytes === null || bytes === undefined) return '-';
    const size = Number(bytes);
    if (Number.isNaN(size) || size === 0) return '0 B';

    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    const exponent = Math.min(Math.floor(Math.log(size) / Math.log(1024)), units.length - 1);
    const value = size / 1024 ** exponent;
    return `${value.toFixed(value >= 10 || exponent === 0 ? 0 : 1)} ${units[exponent]}`;
}

function getCategoryColor(category) {
    const colors = {
        Operasi: 'var(--category-operasi)',
        Analisis: 'var(--category-analisis)',
        Teknis: 'var(--category-teknis)',
        Strategi: 'var(--category-strategi)',
        Umum: 'var(--category-umum)',
    };

    return colors[category] || colors.Umum;
}

function resolveStatusMeta(status) {
    switch (status) {
        case 'published':
            return { label: 'Live', className: 'status-live' };
        case 'draft':
            return { label: 'Draft', className: 'status-draft' };
        case 'archived':
            return { label: 'Archived', className: 'status-archived' };
        default:
            return { label: status ?? 'Unknown', className: 'status-upcoming' };
    }
}

export default function InstructorCoursesPage() {
    const { pushError, pushSuccess } = useNotification();

    const [loading, setLoading] = useState(true);
    const [courses, setCourses] = useState([]);
    const [activeSlug, setActiveSlug] = useState(null);
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [detailLoading, setDetailLoading] = useState(false);

    const [sectionModalOpen, setSectionModalOpen] = useState(false);
    const [sectionForm, setSectionForm] = useState(emptySection);
    const [editingSection, setEditingSection] = useState(null);
    const [savingSection, setSavingSection] = useState(false);

    const [materialModalOpen, setMaterialModalOpen] = useState(false);
    const [materialForm, setMaterialForm] = useState(emptyMaterial);
    const [materialSection, setMaterialSection] = useState(null);
    const [editingMaterial, setEditingMaterial] = useState(null);
    const [savingMaterial, setSavingMaterial] = useState(false);

    const fetchCourses = useCallback(async () => {
        setLoading(true);
        try {
            const response = await instructorClient.get('/courses');
            const items = response.data.data ?? response.data ?? [];
            setCourses(items);

            if (items.length === 0) {
                setActiveSlug(null);
                setSelectedCourse(null);
                return;
            }

            setActiveSlug((current) => {
                if (current && items.some((item) => item.slug === current)) {
                    return current;
                }
                return items[0].slug;
            });
        } catch (error) {
            pushError('Gagal memuat kursus ajar', error.response?.data?.message ?? error.message);
        } finally {
            setLoading(false);
        }
    }, [pushError]);

    const fetchCourseDetail = useCallback(
        async (slug, showLoader = true) => {
            if (!slug) {
                setSelectedCourse(null);
                return null;
            }

            if (showLoader) {
                setDetailLoading(true);
            }

            let detail = null;

            try {
                const response = await instructorClient.get(`/courses/${slug}`);
                detail = response.data.data ?? response.data ?? null;
                setSelectedCourse(detail);
            } catch (error) {
                pushError('Gagal memuat detail kursus', error.response?.data?.message ?? error.message);
            } finally {
                if (showLoader) {
                    setDetailLoading(false);
                }
            }

            return detail;
        },
        [pushError],
    );

    useEffect(() => {
        fetchCourses();
    }, [fetchCourses]);

    useEffect(() => {
        if (!activeSlug) {
            setSelectedCourse(null);
            return;
        }

        fetchCourseDetail(activeSlug);
    }, [activeSlug, fetchCourseDetail]);

    const materialsTotal = useMemo(() => {
        if (!selectedCourse?.sections) return 0;
        return selectedCourse.sections.reduce(
            (total, section) => total + (section.materials?.length ?? 0),
            0,
        );
    }, [selectedCourse]);

    const handleOpenCreateSection = () => {
        if (!activeSlug) return;
        setSectionForm(emptySection);
        setEditingSection(null);
        setSectionModalOpen(true);
    };

    const handleOpenEditSection = (section) => {
        setEditingSection(section);
        setSectionForm({
            title: section.title ?? '',
            summary: section.summary ?? '',
            sort_order:
                section.sort_order === null || section.sort_order === undefined
                    ? ''
                    : section.sort_order,
        });
        setSectionModalOpen(true);
    };

    const handleSectionInputChange = (event) => {
        const { name, value } = event.target;
        setSectionForm((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const closeSectionModal = () => {
        setSectionModalOpen(false);
        setSectionForm(emptySection);
        setEditingSection(null);
    };

    const handleSaveSection = async (event) => {
        event.preventDefault();

        if (!activeSlug) {
            return;
        }

        setSavingSection(true);
        const payload = normalizeSectionPayload(sectionForm);

        try {
            if (editingSection) {
                await instructorClient.patch(`/sections/${editingSection.id}`, payload);
                pushSuccess('Section diperbarui', 'Section berhasil diperbarui.');
            } else {
                await instructorClient.post(`/courses/${activeSlug}/sections`, payload);
                pushSuccess('Section ditambahkan', 'Section baru berhasil dibuat.');
            }

            closeSectionModal();

            const detail = await fetchCourseDetail(activeSlug, false);
            if (detail) {
                setCourses((prev) =>
                    prev.map((course) =>
                        course.slug === detail.slug
                            ? {
                                  ...course,
                                  sections_count: detail.sections?.length ?? course.sections_count,
                                  updated_at: detail.updated_at,
                              }
                            : course,
                    ),
                );
            }
        } catch (error) {
            pushError('Gagal menyimpan section', error.response?.data?.message ?? error.message);
        } finally {
            setSavingSection(false);
        }
    };

    const handleDeleteSection = async (section) => {
        const result = await Swal.fire({
            title: 'Hapus section?',
            text: `Section "${section.title}" dan seluruh materinya akan dihapus.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#94a3b8',
            confirmButtonText: 'Hapus',
            cancelButtonText: 'Batal',
        });

        if (!result.isConfirmed) return;

        try {
            await instructorClient.delete(`/sections/${section.id}`);
            pushSuccess('Section dihapus', 'Section berhasil dihapus.');

            const detail = await fetchCourseDetail(activeSlug, false);
            if (detail) {
                setCourses((prev) =>
                    prev.map((course) =>
                        course.slug === detail.slug
                            ? {
                                  ...course,
                                  sections_count: detail.sections?.length ?? course.sections_count,
                                  updated_at: detail.updated_at,
                              }
                            : course,
                    ),
                );
            }
        } catch (error) {
            pushError('Gagal menghapus section', error.response?.data?.message ?? error.message);
        }
    };

    const handleOpenCreateMaterial = (section) => {
        setMaterialSection(section);
        setEditingMaterial(null);
        setMaterialForm(emptyMaterial);
        setMaterialModalOpen(true);
    };

    const handleOpenEditMaterial = (section, material) => {
        setMaterialSection(section);
        setEditingMaterial(material);
        setMaterialForm({
            title: material.title ?? '',
            description: material.description ?? '',
            sort_order:
                material.sort_order === null || material.sort_order === undefined
                    ? ''
                    : material.sort_order,
            file: null,
        });
        setMaterialModalOpen(true);
    };

    const handleMaterialInputChange = (event) => {
        const { name, value } = event.target;
        setMaterialForm((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleMaterialFileChange = (event) => {
        const [file] = event.target.files;
        setMaterialForm((prev) => ({
            ...prev,
            file: file ?? null,
        }));
    };

    const closeMaterialModal = () => {
        setMaterialModalOpen(false);
        setMaterialForm(emptyMaterial);
        setMaterialSection(null);
        setEditingMaterial(null);
    };

    const handleSaveMaterial = async (event) => {
        event.preventDefault();

        if (!materialSection) {
            return;
        }

        if (!editingMaterial && !materialForm.file) {
            pushError('Gagal menyimpan materi', 'Silakan pilih file materi terlebih dahulu.');
            return;
        }

        setSavingMaterial(true);

        const formData = new FormData();

        if (materialForm.title) {
            formData.append('title', materialForm.title);
        }

        if (materialForm.description) {
            formData.append('description', materialForm.description);
        }

        if (materialForm.sort_order !== '' && !Number.isNaN(Number(materialForm.sort_order))) {
            formData.append('sort_order', Number(materialForm.sort_order));
        }

        if (materialForm.file) {
            formData.append('file', materialForm.file);
        }

        if (editingMaterial) {
            formData.append('_method', 'PATCH');
        }

        try {
            if (editingMaterial) {
                await instructorClient.post(`/materials/${editingMaterial.id}`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
                pushSuccess('Materi diperbarui', 'Materi berhasil diperbarui.');
            } else {
                await instructorClient.post(`/sections/${materialSection.id}/materials`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
                pushSuccess('Materi ditambahkan', 'Materi berhasil diunggah.');
            }

            closeMaterialModal();

            const detail = await fetchCourseDetail(activeSlug, false);
            if (detail) {
                setCourses((prev) =>
                    prev.map((course) =>
                        course.slug === detail.slug
                            ? {
                                  ...course,
                                  sections_count: detail.sections?.length ?? course.sections_count,
                                  updated_at: detail.updated_at,
                              }
                            : course,
                    ),
                );
            }
        } catch (error) {
            pushError('Gagal menyimpan materi', error.response?.data?.message ?? error.message);
        } finally {
            setSavingMaterial(false);
        }
    };

    const handleDeleteMaterial = async (material) => {
        const result = await Swal.fire({
            title: 'Hapus materi?',
            text: `Materi "${material.title ?? material.file_name}" akan dihapus permanen.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#94a3b8',
            confirmButtonText: 'Hapus',
            cancelButtonText: 'Batal',
        });

        if (!result.isConfirmed) return;

        try {
            await instructorClient.delete(`/materials/${material.id}`);
            pushSuccess('Materi dihapus', 'Materi berhasil dihapus.');

            const detail = await fetchCourseDetail(activeSlug, false);
            if (detail) {
                setCourses((prev) =>
                    prev.map((course) =>
                        course.slug === detail.slug
                            ? {
                                  ...course,
                                  sections_count: detail.sections?.length ?? course.sections_count,
                                  updated_at: detail.updated_at,
                              }
                            : course,
                    ),
                );
            }
        } catch (error) {
            pushError('Gagal menghapus materi', error.response?.data?.message ?? error.message);
        }
    };

    return (
        <div className="instructor-dashboard">
            <section className="instructor-hero-card">
                <div className="hero-content">
                    <div className="hero-text">
                        <h1>Kursus Ajar</h1>
                        <p>Kelola section dan materi untuk seluruh kursus yang Anda pimpin setiap hari.</p>
                    </div>
                    <div className="hero-stats">
                        <div className="hero-stat-card">
                            <div className="hero-stat-value">{courses.length}</div>
                            <div className="hero-stat-label">Total Kursus</div>
                        </div>
                        <div className="hero-stat-card">
                            <div className="hero-stat-value">{materialsTotal}</div>
                            <div className="hero-stat-label">Total Materi</div>
                        </div>
                    </div>
                </div>
            </section>

            <div className="instructor-course-layout">
                <div className="instructor-course-list">
                    {loading ? (
                        <div className="instructor-loading-state">
                            <div className="loading-spinner medium" />
                            <h3>Memuat kursus...</h3>
                        </div>
                    ) : courses.length === 0 ? (
                        <div className="instructor-empty-state">
                            <div className="empty-icon">🎓</div>
                            <h3>Belum ada kursus ajar</h3>
                            <p>Tunggu penugasan admin untuk mulai mengelola kursus.</p>
                        </div>
                    ) : (
                        <div className="instructor-course-list-scroll">
                            {courses.map((course) => {
                                const isActive = course.slug === activeSlug;
                                const statusMeta = resolveStatusMeta(course.status);

                                return (
                                    <button
                                        key={course.id}
                                        type="button"
                                        className={`instructor-course-item${isActive ? ' active' : ''}`}
                                        onClick={() => setActiveSlug(course.slug)}
                                    >
                                        <div className="course-item-top">
                                            <span className={`status-pill ${statusMeta.className}`}>
                                                {statusMeta.label}
                                            </span>
                                            <span className="course-meta">
                                                {course.sections_count ?? 0} section
                                            </span>
                                        </div>
                                        <h4>{course.title}</h4>
                                        <p>{course.short_description ?? 'Belum ada ringkasan kursus.'}</p>
                                        <div className="course-item-footer">
                                            {course.updated_at ? (
                                                <span>Diperbarui {formatDateTime(course.updated_at)}</span>
                                            ) : null}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>

                <div className="instructor-course-detail">
                    {detailLoading ? (
                        <div className="instructor-loading-state">
                            <div className="loading-spinner medium" />
                            <h3>Memuat detail...</h3>
                        </div>
                    ) : !selectedCourse ? (
                        <div className="instructor-empty-state">
                            <div className="empty-icon">📘</div>
                            <h3>Pilih kursus</h3>
                            <p>Pilih salah satu kursus di sebelah kiri untuk mulai mengelola section dan materi.</p>
                        </div>
                    ) : (
                        <div className="instructor-detail-card">
                            <header className="detail-header">
                                <div className="detail-title-group">
                                    <div
                                        className="course-category-badge"
                                        style={{
                                            backgroundColor: getCategoryColor(
                                                selectedCourse.classification?.name,
                                            ),
                                        }}
                                    >
                                        {selectedCourse.classification?.name ?? 'Umum'}
                                    </div>
                                    <h2>{selectedCourse.title}</h2>
                                </div>
                                <div className="detail-stats">
                                    <div className="stat-item">
                                        <span className="stat-icon">📚</span>
                                        <span>{selectedCourse.sections?.length ?? 0} section</span>
                                    </div>
                                    <div className="stat-item">
                                        <span className="stat-icon">📄</span>
                                        <span>{materialsTotal} materi</span>
                                    </div>
                                    {selectedCourse.statistics?.enrollments !== undefined ? (
                                        <div className="stat-item">
                                            <span className="stat-icon">👥</span>
                                            <span>
                                                {selectedCourse.statistics.enrollments ?? 0} peserta aktif
                                            </span>
                                        </div>
                                    ) : null}
                                </div>
                            </header>

                            <div
                                className="detail-description"
                                dangerouslySetInnerHTML={{
                                    __html:
                                        sanitizeHtml(selectedCourse.description) ||
                                        '<p>Belum ada deskripsi lengkap untuk kursus ini.</p>',
                                }}
                            />

                            <div className="section-toolbar">
                                <button
                                    type="button"
                                    className="primary-button"
                                    onClick={handleOpenCreateSection}
                                >
                                    <PlusIcon /> Section Baru
                                </button>
                            </div>

                            {selectedCourse.sections?.length ? (
                                <div className="instructor-section-list">
                                    {selectedCourse.sections.map((section) => (
                                        <div key={section.id} className="instructor-section-card">
                                            <div className="instructor-section-header">
                                                <div>
                                                    <h3>{section.title}</h3>
                                                    <p>{section.summary ?? 'Belum ada ringkasan section.'}</p>
                                                </div>
                                                <div className="section-actions">
                                                    {section.sort_order !== null &&
                                                    section.sort_order !== undefined ? (
                                                        <span className="order-badge">
                                                            Urutan {section.sort_order}
                                                        </span>
                                                    ) : null}
                                                    <button
                                                        type="button"
                                                        className="icon-button"
                                                        onClick={() => handleOpenEditSection(section)}
                                                        aria-label="Edit section"
                                                    >
                                                        <EditIcon />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className="icon-button danger"
                                                        onClick={() => handleDeleteSection(section)}
                                                        aria-label="Hapus section"
                                                    >
                                                        <DeleteIcon />
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="section-toolbar">
                                                <button
                                                    type="button"
                                                    className="ghost-button"
                                                    onClick={() => handleOpenCreateMaterial(section)}
                                                >
                                                    <PlusIcon /> Materi
                                                </button>
                                            </div>

                                            {section.materials?.length ? (
                                                <ul className="instructor-material-list">
                                                    {section.materials.map((material) => (
                                                        <li key={material.id} className="instructor-material-item">
                                                            <div className="material-core">
                                                                <strong>{material.title ?? material.file_name}</strong>
                                                                <p>
                                                                    {material.description ??
                                                                        'Belum ada deskripsi materi.'}
                                                                </p>
                                                                <div className="material-meta">
                                                                    <span>{formatFileSize(material.file_size)}</span>
                                                                    {material.sort_order !== null &&
                                                                    material.sort_order !== undefined ? (
                                                                        <span>Urutan {material.sort_order}</span>
                                                                    ) : null}
                                                                </div>
                                                            </div>
                                                            <div className="material-actions">
                                                                {material.file_url ? (
                                                                    <a
                                                                        href={material.file_url}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="download-link"
                                                                    >
                                                                        Unduh
                                                                    </a>
                                                                ) : null}
                                                                <button
                                                                    type="button"
                                                                    className="icon-button"
                                                                    onClick={() =>
                                                                        handleOpenEditMaterial(section, material)
                                                                    }
                                                                    aria-label="Edit materi"
                                                                >
                                                                    <EditIcon />
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    className="icon-button danger"
                                                                    onClick={() => handleDeleteMaterial(material)}
                                                                    aria-label="Hapus materi"
                                                                >
                                                                    <DeleteIcon />
                                                                </button>
                                                            </div>
                                                        </li>
                                                    ))}
                                                </ul>
                                            ) : (
                                                <div className="instructor-empty-material">
                                                    Belum ada materi pada section ini.
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="instructor-empty-state subtle">
                                    <div className="empty-icon">🧭</div>
                                    <h3>Belum ada section</h3>
                                    <p>Gunakan tombol &quot;Section Baru&quot; untuk mulai mengatur alur belajar.</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <Modal
                open={sectionModalOpen}
                title={editingSection ? 'Perbarui Section' : 'Section Baru'}
                description={
                    editingSection
                        ? 'Sesuaikan informasi section untuk menjaga alur pembelajaran tetap rapi.'
                        : 'Buat section baru untuk mengelompokkan materi misi.'
                }
                onClose={closeSectionModal}
                footer={
                    <>
                        <button type="button" className="ghost-button" onClick={closeSectionModal}>
                            Batal
                        </button>
                        <button
                            type="submit"
                            form="section-form"
                            className="primary-button"
                            disabled={savingSection}
                        >
                            {savingSection ? 'Menyimpan...' : 'Simpan'}
                        </button>
                    </>
                }
            >
                <form
                    id="section-form"
                    className="form-grid instructor-modal-form"
                    onSubmit={handleSaveSection}
                >
                    <div className="form-field">
                        <label htmlFor="section_title">Judul Section</label>
                        <input
                            id="section_title"
                            name="title"
                            type="text"
                            required
                            value={sectionForm.title}
                            onChange={handleSectionInputChange}
                            placeholder="Contoh: Phase Briefing"
                        />
                        <span className="field-hint">Gunakan judul singkat yang mudah diingat peserta.</span>
                    </div>

                    <div className="form-field">
                        <label htmlFor="section_summary">Ringkasan</label>
                        <textarea
                            id="section_summary"
                            name="summary"
                            value={sectionForm.summary}
                            onChange={handleSectionInputChange}
                            placeholder="Deskripsikan fokus utama section ini."
                            rows={4}
                        />
                        <span className="field-hint">Tuliskan highlight section untuk membantu orientasi awal.</span>
                    </div>

                    <div className="form-field">
                        <label htmlFor="section_sort_order">Urutan (opsional)</label>
                        <input
                            id="section_sort_order"
                            name="sort_order"
                            type="number"
                            min="0"
                            value={sectionForm.sort_order}
                            onChange={handleSectionInputChange}
                            placeholder="Urutan tampil (kosongkan untuk otomatis)"
                        />
                        <span className="field-hint">Kosongkan jika ingin sistem mengurutkan otomatis.</span>
                    </div>
                </form>
            </Modal>

            <Modal
                open={materialModalOpen}
                title={editingMaterial ? 'Perbarui Materi' : 'Materi Baru'}
                description={
                    editingMaterial
                        ? 'Perbarui materi untuk memastikan konten tetap relevan.'
                        : 'Unggah materi pendukung section seperti PDF, video, atau catatan.'
                }
                onClose={closeMaterialModal}
                footer={
                    <>
                        <button type="button" className="ghost-button" onClick={closeMaterialModal}>
                            Batal
                        </button>
                        <button
                            type="submit"
                            form="material-form"
                            className="primary-button"
                            disabled={savingMaterial}
                        >
                            {savingMaterial ? 'Mengunggah...' : 'Simpan Materi'}
                        </button>
                    </>
                }
            >
                <form
                    id="material-form"
                    className="form-grid instructor-modal-form"
                    onSubmit={handleSaveMaterial}
                >
                    <div className="form-field">
                        <label htmlFor="material_title">Judul Materi</label>
                        <input
                            id="material_title"
                            name="title"
                            type="text"
                            value={materialForm.title}
                            onChange={handleMaterialInputChange}
                            placeholder="Judul materi (opsional)"
                        />
                        <span className="field-hint">Isi jika ingin menampilkan judul berbeda dari nama file.</span>
                    </div>

                    <div className="form-field">
                        <label htmlFor="material_description">Deskripsi</label>
                        <textarea
                            id="material_description"
                            name="description"
                            value={materialForm.description}
                            onChange={handleMaterialInputChange}
                            placeholder="Ringkasan singkat atau instruksi materi."
                            rows={4}
                        />
                        <span className="field-hint">Berikan konteks singkat agar peserta tahu apa yang diharapkan.</span>
                    </div>

                    <div className="form-field">
                        <label htmlFor="material_sort_order">Urutan (opsional)</label>
                        <input
                            id="material_sort_order"
                            name="sort_order"
                            type="number"
                            min="0"
                            value={materialForm.sort_order}
                            onChange={handleMaterialInputChange}
                            placeholder="Biarkan kosong untuk otomatis"
                        />
                        <span className="field-hint">Gunakan angka kecil untuk memprioritaskan materi penting.</span>
                    </div>

                    <div className="form-field">
                        <label htmlFor="material_file">
                            File Materi {editingMaterial ? '(opsional)' : ''}
                        </label>
                        <input
                            id="material_file"
                            name="file"
                            type="file"
                            onChange={handleMaterialFileChange}
                            accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.zip,.rar,.mp4,.mp3,.txt,.csv,image/*,video/*,audio/*"
                        />
                        <span className="field-hint">
                            Format populer seperti PDF, PPT, MP4, MP3, atau ZIP hingga 500MB.
                        </span>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
