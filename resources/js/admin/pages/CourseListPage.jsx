import { useCallback, useEffect, useMemo, useState } from 'react';
import Swal from 'sweetalert2';
import client from '../api/client';
import { useNotification } from '../context/NotificationContext';
import useDebounce from '../hooks/useDebounce';
import Modal from '../components/Modal';

const EditIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
        <path d="M4 21h4l11-11-4-4L4 17v4z" strokeLinejoin="round" />
        <path d="M14 5l4 4" strokeLinecap="round" />
    </svg>
);

const DeleteIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
        <path d="M3 6h18" strokeLinecap="round" />
        <path d="M8 6v-2h8v2" strokeLinecap="round" />
        <path d="M19 6v14H5V6" strokeLinejoin="round" />
        <path d="M10 11v6M14 11v6" strokeLinecap="round" />
    </svg>
);

const PreviewIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
        <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" strokeLinejoin="round" />
        <circle cx="12" cy="12" r="3" />
    </svg>
);

const escapeHtml = (value) =>
    typeof value === 'string'
        ? value
              .replace(/&/g, '&amp;')
              .replace(/</g, '&lt;')
              .replace(/>/g, '&gt;')
              .replace(/"/g, '&quot;')
              .replace(/'/g, '&#039;')
        : value ?? '';

const emptyCourse = {
    title: '',
    slug: '',
    status: 'draft',
    classification_id: '',
    duration_minutes: '',
    category_id: '',
    instructor_id: '',
    short_description: '',
    description: '',
    published_at: '',
};

function formatDateForInput(value) {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
        date.getDate(),
    ).padStart(2, '0')}T${String(date.getHours()).padStart(2, '0')}:${String(
        date.getMinutes(),
    ).padStart(2, '0')}`;
}

function normalizePayload(form) {
    const payload = {
        title: form.title,
        slug: form.slug || undefined,
        status: form.status,
        classification_id: form.classification_id
            ? Number(form.classification_id)
            : undefined,
        short_description: form.short_description || undefined,
        description: form.description || undefined,
        duration_minutes: form.duration_minutes ? Number(form.duration_minutes) : undefined,
        category_id: form.category_id ? Number(form.category_id) : undefined,
        instructor_id: form.instructor_id ? Number(form.instructor_id) : undefined,
        published_at: form.published_at ? new Date(form.published_at).toISOString() : undefined,
    };

    return payload;
}

export default function CourseListPage() {
    const [courses, setCourses] = useState([]);
    const [meta, setMeta] = useState({ current_page: 1, last_page: 1, total: 0 });
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({ search: '', status: '', classification_id: '' });
    const [classifications, setClassifications] = useState([]);
    const [page, setPage] = useState(1);
    const debouncedSearch = useDebounce(filters.search);

    const [modalOpen, setModalOpen] = useState(false);
    const [form, setForm] = useState(emptyCourse);
    const [editingCourse, setEditingCourse] = useState(null);

    const { pushError, pushSuccess } = useNotification();

    useEffect(() => {
        async function loadClassifications() {
            try {
                const response = await client.get('/course-classifications');
                setClassifications(response.data.data ?? response.data ?? []);
            } catch (error) {
                pushError('Gagal memuat klasifikasi', error.response?.data?.message ?? error.message);
            }
        }

        loadClassifications();
    }, [pushError]);

    const fetchCourses = useCallback(
        async (pageNumber = 1) => {
            setLoading(true);
            try {
                const response = await client.get('/courses', {
                    params: {
                        page: pageNumber,
                        search: debouncedSearch || undefined,
                        status: filters.status || undefined,
                        classification_id: filters.classification_id || undefined,
                    },
                });
                setCourses(response.data.data);
                const metaResponse = response.data.meta;
                setMeta(metaResponse);
                setPage(metaResponse.current_page);
            } catch (error) {
                pushError('Gagal memuat kursus', error.response?.data?.message ?? error.message);
            } finally {
                setLoading(false);
            }
        },
        [debouncedSearch, filters.classification_id, filters.status, pushError],
    );

    useEffect(() => {
        setPage(1);
        fetchCourses(1);
    }, [debouncedSearch, filters.classification_id, filters.status, fetchCourses]);

    const handleOpenCreate = () => {
        const defaultClassification = classifications.find((item) => item.is_active) ?? classifications[0];
        setEditingCourse(null);
        setForm({
            ...emptyCourse,
            classification_id: defaultClassification ? String(defaultClassification.id) : '',
        });
        setModalOpen(true);
    };

    const handleOpenEdit = (course) => {
        setEditingCourse(course);
        const classificationId =
            course.classification?.id ?? course.classification_id ?? '';

        setForm({
            title: course.title ?? '',
            slug: course.slug ?? '',
            status: course.status ?? 'draft',
            classification_id: classificationId ? String(classificationId) : '',
            duration_minutes: course.duration_minutes ?? '',
            category_id: course.category?.id ?? course.category_id ?? '',
            instructor_id: course.instructor?.id ?? course.instructor_id ?? '',
            short_description: course.short_description ?? '',
            description: course.description ?? '',
            published_at: formatDateForInput(course.published_at),
        });
        setModalOpen(true);
    };

    const handleCloseModal = () => {
        setModalOpen(false);
    };

    const handleChange = (event) => {
        const { name, value } = event.target;
        setForm((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        const payload = normalizePayload(form);

        try {
            if (editingCourse) {
                await client.patch(`/courses/${editingCourse.slug}`, payload);
                pushSuccess('Kursus diperbarui', 'Data kursus berhasil disimpan.');
            } else {
                await client.post('/courses', payload);
                pushSuccess('Kursus dibuat', 'Kursus baru berhasil ditambahkan.');
            }
            handleCloseModal();
            fetchCourses(page);
        } catch (error) {
            pushError('Gagal menyimpan kursus', error.response?.data?.message ?? error.message);
        }
    };

    const handlePreview = async (course) => {
        try {
            const response = await client.get(`/courses/${course.slug}`);
            const detail = response.data.data ?? response.data;

            Swal.fire({
                title: detail.title,
                html: `
                    <div style="text-align:left;display:grid;gap:0.6rem;font-size:0.92rem">
                        <div><strong>Status:</strong> ${escapeHtml(detail.status ?? '-')}</div>
                        <div><strong>Klasifikasi:</strong> ${escapeHtml(detail.classification?.name ?? '-')}</div>
                        <div><strong>Ringkasan:</strong><br>${escapeHtml(detail.short_description ?? 'Belum ada ringkasan.')}</div>
                        <div><strong>Deskripsi:</strong><br>${escapeHtml(detail.description ?? 'Belum ada deskripsi.')}</div>
                        <div><strong>Jumlah Modul:</strong> ${detail.modules?.length ?? '-'}</div>
                        <div><strong>Enrollments:</strong> ${detail.stats?.enrollments ?? 0}</div>
                    </div>
                `,
                width: 600,
                confirmButtonText: 'Tutup',
            });
        } catch (error) {
            pushError('Gagal memuat detail kursus', error.response?.data?.message ?? error.message);
        }
    };

    const handleDelete = async (course) => {
        const result = await Swal.fire({
            title: 'Hapus kursus?',
            text: `Kursus "${course.title}" akan dihapus permanen.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#94a3b8',
            confirmButtonText: 'Ya, hapus',
            cancelButtonText: 'Batal',
            reverseButtons: true,
        });

        if (!result.isConfirmed) {
            return;
        }

        try {
            await client.delete(`/courses/${course.slug}`);
            pushSuccess('Kursus dihapus', 'Data kursus berhasil dihapus.');
            fetchCourses(page);
        } catch (error) {
            pushError('Gagal menghapus kursus', error.response?.data?.message ?? error.message);
        }
    };

    const disabledPrev = page <= 1;
    const disabledNext = page >= meta.last_page;

    const summary = useMemo(() => {
        if (!meta.total) return 'Tidak ada kursus terdaftar.';
        return `${meta.total} kursus • Halaman ${meta.current_page} dari ${meta.last_page}`;
    }, [meta]);

    return (
        <>
            <section className="surface">
                <div className="surface-header">
                    <div>
                        <div className="surface-title">Manajemen Kursus</div>
                        <div className="surface-subtitle">
                            Kelola katalog kursus non-komersial, atur status rilis, dan pantau keterlibatan peserta.
                        </div>
                    </div>
                    <div className="table-actions">
                        <button type="button" className="btn btn-ghost" onClick={() => fetchCourses(page)}>
                            Muat Ulang
                        </button>
                        <button type="button" className="btn btn-primary" onClick={handleOpenCreate}>
                            + Kursus Baru
                        </button>
                    </div>
                </div>

                <div className="filters-row">
                    <input
                        type="search"
                        placeholder="Cari judul kursus..."
                        value={filters.search}
                        onChange={(event) =>
                            setFilters((prev) => ({ ...prev, search: event.target.value }))
                        }
                    />
                    <select
                        value={filters.status}
                        onChange={(event) =>
                            setFilters((prev) => ({ ...prev, status: event.target.value }))
                        }
                    >
                        <option value="">Semua status</option>
                        <option value="draft">Draft</option>
                        <option value="published">Published</option>
                        <option value="archived">Archived</option>
                    </select>
                    <select
                        value={filters.classification_id}
                        onChange={(event) =>
                            setFilters((prev) => ({ ...prev, classification_id: event.target.value }))
                        }
                    >
                        <option value="">Semua klasifikasi</option>
                        {classifications.map((classification) => (
                            <option key={classification.id} value={classification.id}>
                                {classification.name}
                            </option>
                        ))}
                    </select>
                </div>

                {loading ? (
                    <div className="empty-state">
                        <h2>Memuat data kursus...</h2>
                        <p>Silakan tunggu sejenak, kami sedang mengambil data dari server.</p>
                    </div>
                ) : courses.length === 0 ? (
                    <div className="empty-state">
                        <h2>Belum ada kursus</h2>
                        <p>
                            Mulai tambah kursus untuk mengisi katalog pembelajaran Anda. Kursus bisa
                            berupa video, modul teks, maupun blended learning.
                        </p>
                        <button type="button" className="btn btn-primary" onClick={handleOpenCreate}>
                            Buat Kursus
                        </button>
                    </div>
                ) : (
                    <>
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Judul</th>
                                    <th>Kategori</th>
                                    <th>Klasifikasi</th>
                                    <th>Status</th>
                                    <th>Enrollments</th>
                                    <th>Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {courses.map((course) => (
                                    <tr key={course.id}>
                                        <td>
                                            <div style={{ fontWeight: 600, color: '#111827' }}>
                                                {course.title}
                                            </div>
                                            <div style={{ color: '#64748b', fontSize: '0.82rem' }}>
                                                {course.short_description || 'Belum ada ringkasan.'}
                                            </div>
                                        </td>
                                        <td>{course.category?.name ?? '-'}</td>
                                        <td>
                                            <span className="chip">
                                                {course.classification?.name ?? 'Tidak diklasifikasikan'}
                                            </span>
                                        </td>
                                        <td>
                                            <span
                                                className={`badge ${
                                                    course.status === 'published'
                                                        ? 'badge-success'
                                                        : course.status === 'archived'
                                                        ? 'badge-warning'
                                                        : 'badge-info'
                                                }`}
                                            >
                                                {course.status}
                                            </span>
                                        </td>
                                        <td>{course.stats?.enrollments ?? 0}</td>
                                        <td>
                                            <div className="table-actions">
                                                <button
                                                    type="button"
                                                    className="btn btn-ghost btn-icon"
                                                    onClick={() => handlePreview(course)}
                                                    title="Lihat detail kursus"
                                                >
                                                    <PreviewIcon />
                                                </button>
                                                <button
                                                    type="button"
                                                    className="btn btn-ghost btn-icon"
                                                    onClick={() => handleOpenEdit(course)}
                                                    title="Edit kursus"
                                                >
                                                    <EditIcon />
                                                </button>
                                                <button
                                                    type="button"
                                                    className="btn btn-danger btn-icon"
                                                    onClick={() => handleDelete(course)}
                                                    title="Hapus kursus"
                                                >
                                                    <DeleteIcon />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <div className="pagination">
                            <div>{summary}</div>
                            <div className="pagination-controls">
                                <button
                                    type="button"
                                    className="btn btn-ghost"
                                    disabled={disabledPrev}
                                    onClick={() => !disabledPrev && fetchCourses(page - 1)}
                                >
                                    ‹ Sebelumnya
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-ghost"
                                    disabled={disabledNext}
                                    onClick={() => !disabledNext && fetchCourses(page + 1)}
                                >
                                    Selanjutnya ›
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </section>

            <Modal
                open={modalOpen}
                onClose={handleCloseModal}
                title={editingCourse ? 'Perbarui Kursus' : 'Kursus Baru'}
                description="Lengkapi informasi kurikulum untuk peserta Anda."
                footer={
                    <>
                        <button type="button" className="btn btn-ghost" onClick={handleCloseModal}>
                            Batal
                        </button>
                        <button type="submit" form="course-form" className="btn btn-primary">
                            Simpan Kursus
                        </button>
                    </>
                }
            >
                <form id="course-form" className="form-grid" onSubmit={handleSubmit}>
                    <div className="form-field">
                        <label htmlFor="title">Judul Kursus</label>
                        <input
                            id="title"
                            name="title"
                            value={form.title}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="form-field">
                        <label htmlFor="slug">Slug (opsional)</label>
                        <input
                            id="slug"
                            name="slug"
                            value={form.slug}
                            onChange={handleChange}
                            placeholder="otomatis dari judul jika dikosongkan"
                        />
                    </div>
                    <div className="form-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.85rem' }}>
                        <div className="form-field">
                            <label htmlFor="status">Status</label>
                            <select
                                id="status"
                                name="status"
                                value={form.status}
                                onChange={handleChange}
                            >
                                <option value="draft">Draft</option>
                                <option value="published">Published</option>
                                <option value="archived">Archived</option>
                            </select>
                        </div>
                        <div className="form-field">
                            <label htmlFor="classification_id">Klasifikasi kursus</label>
                            <select
                                id="classification_id"
                                name="classification_id"
                                value={form.classification_id}
                                onChange={handleChange}
                                required
                            >
                                <option value="" disabled>
                                    Pilih klasifikasi
                                </option>
                                {classifications.map((classification) => (
                                    <option key={classification.id} value={classification.id}>
                                        {classification.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="form-field">
                            <label htmlFor="duration_minutes">Durasi (menit)</label>
                            <input
                                id="duration_minutes"
                                name="duration_minutes"
                                type="number"
                                value={form.duration_minutes}
                                onChange={handleChange}
                                min="0"
                            />
                        </div>
                    </div>
                    <div className="form-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.85rem' }}>
                        <div className="form-field">
                            <label htmlFor="category_id">ID Kategori</label>
                            <input
                                id="category_id"
                                name="category_id"
                                value={form.category_id}
                                onChange={handleChange}
                                placeholder="Masukkan ID kategori (opsional)"
                            />
                        </div>
                        <div className="form-field">
                            <label htmlFor="instructor_id">ID Instruktur</label>
                            <input
                                id="instructor_id"
                                name="instructor_id"
                                value={form.instructor_id}
                                onChange={handleChange}
                                placeholder="Masukkan ID instruktur (opsional)"
                            />
                        </div>
                        <div className="form-field">
                            <label htmlFor="published_at">Tanggal Publish</label>
                            <input
                                id="published_at"
                                name="published_at"
                                type="datetime-local"
                                value={form.published_at}
                                onChange={handleChange}
                            />
                        </div>
                    </div>
                    <div className="form-field">
                        <label htmlFor="short_description">Ringkasan</label>
                        <textarea
                            id="short_description"
                            name="short_description"
                            value={form.short_description}
                            onChange={handleChange}
                            rows={3}
                        />
                    </div>
                    <div className="form-field">
                        <label htmlFor="description">Deskripsi Lengkap</label>
                        <textarea
                            id="description"
                            name="description"
                            value={form.description}
                            onChange={handleChange}
                            rows={6}
                        />
                    </div>
                </form>
            </Modal>
        </>
    );
}
