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

const emptyInstructor = {
    name: '',
    email: '',
    phone: '',
    password: '',
    expertise: '',
    bio: '',
    linkedin: '',
    unit_id: '',
};

function buildInstructorPayload(form, isUpdate = false) {
    const profile = {
        expertise: form.expertise || undefined,
        bio: form.bio || undefined,
    };

    if (form.linkedin) {
        profile.socials = {
            linkedin: form.linkedin,
        };
    }

    const payload = {
        name: form.name,
        email: form.email,
        phone: form.phone || undefined,
        unit_id: form.unit_id ? Number(form.unit_id) : null,
        profile: Object.values(profile).some((value) => value) ? profile : undefined,
    };

    if (!isUpdate || form.password) {
        payload.password = form.password;
    }

    return payload;
}

export default function InstructorListPage() {
    const [instructors, setInstructors] = useState([]);
    const [meta, setMeta] = useState({ current_page: 1, last_page: 1, total: 0 });
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const debouncedSearch = useDebounce(search);

    const [modalOpen, setModalOpen] = useState(false);
    const [form, setForm] = useState(emptyInstructor);
    const [editingInstructor, setEditingInstructor] = useState(null);
    const [units, setUnits] = useState([]);

    const { pushError, pushSuccess } = useNotification();

    const fetchInstructors = useCallback(
        async (pageNumber = 1) => {
            setLoading(true);
            try {
                const response = await client.get('/instructors', {
                    params: {
                        page: pageNumber,
                        search: debouncedSearch || undefined,
                    },
                });

                const metaResponse = response.data.meta;
                setInstructors(response.data.data);
                setMeta(metaResponse);
                setPage(metaResponse.current_page);
            } catch (error) {
                pushError(
                    'Gagal memuat instruktur',
                    error.response?.data?.message ?? error.message,
                );
            } finally {
                setLoading(false);
            }
        },
        [debouncedSearch, pushError],
    );

    const loadUnits = useCallback(async () => {
        try {
            const response = await client.get('/units', {
                params: {
                    per_page: 200,
                    is_active: true,
                },
            });
            setUnits(response.data.data ?? []);
        } catch (error) {
            pushError('Gagal memuat daftar unit', error.response?.data?.message ?? error.message);
        }
    }, [pushError]);

    useEffect(() => {
        loadUnits();
    }, [loadUnits]);

    useEffect(() => {
        setPage(1);
        fetchInstructors(1);
    }, [debouncedSearch, fetchInstructors]);

    const handleOpenCreate = () => {
        setEditingInstructor(null);
        setForm(emptyInstructor);
        setModalOpen(true);
    };

    const handleOpenEdit = (instructor) => {
        setEditingInstructor(instructor);
        setForm({
            name: instructor.name ?? '',
            email: instructor.email ?? '',
            phone: instructor.phone ?? '',
            password: '',
            expertise: instructor.profile?.expertise ?? '',
            bio: instructor.profile?.bio ?? '',
            linkedin: instructor.profile?.socials?.linkedin ?? '',
            unit_id: instructor.unit?.id ?? instructor.unit_id ?? '',
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
        const payload = buildInstructorPayload(form, Boolean(editingInstructor));

        try {
            if (editingInstructor) {
                await client.patch(`/instructors/${editingInstructor.id}`, payload);
                pushSuccess('Instruktur diperbarui', 'Profil instruktur berhasil disimpan.');
            } else {
                await client.post('/instructors', payload);
                pushSuccess('Instruktur ditambahkan', 'Instruktur baru siap ditugaskan ke kursus.');
            }
            handleCloseModal();
            fetchInstructors(page);
        } catch (error) {
            pushError('Gagal menyimpan instruktur', error.response?.data?.message ?? error.message);
        }
    };

    const handleDelete = async (instructor) => {
        const result = await Swal.fire({
            title: 'Nonaktifkan instruktur?',
            text: `Instruktur "${instructor.name}" tidak lagi memiliki akses ke kursus yang dikelola.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#94a3b8',
            confirmButtonText: 'Ya, nonaktifkan',
            cancelButtonText: 'Batal',
            reverseButtons: true,
        });

        if (!result.isConfirmed) {
            return;
        }

        try {
            await client.delete(`/instructors/${instructor.id}`);
            pushSuccess('Instruktur dihapus', 'Data instruktur berhasil dinonaktifkan.');
            fetchInstructors(page);
        } catch (error) {
            pushError('Gagal menghapus instruktur', error.response?.data?.message ?? error.message);
        }
    };

    const handlePreview = async (instructor) => {
        try {
            const response = await client.get(`/instructors/${instructor.id}`);
            const detail = response.data.data ?? response.data;

            const courseList = (detail.teaching_courses ?? [])
                .map((course) => `<li>${escapeHtml(course.title)} (${escapeHtml(course.status)})</li>`)
                .join('');

            Swal.fire({
                title: detail.name,
                html: `
                    <div style="text-align:left;display:grid;gap:0.6rem;font-size:0.92rem">
                        <div><strong>Email:</strong> ${escapeHtml(detail.email)}</div>
                        <div><strong>Telepon:</strong> ${escapeHtml(detail.phone ?? '-')}</div>
                        <div><strong>Unit:</strong> ${escapeHtml(detail.unit?.name ?? '-')}</div>
                        <div><strong>Keahlian:</strong> ${escapeHtml(detail.profile?.expertise ?? '-')}</div>
                        <div><strong>Bio:</strong><br>${escapeHtml(detail.profile?.bio ?? 'Belum ada bio.')}</div>
                        <div><strong>Kursus dibina:</strong> ${detail.meta?.teaching_courses ?? 0}</div>
                        ${courseList ? `<div><ul style="padding-left:1.25rem;margin:0">${courseList}</ul></div>` : ''}
                    </div>
                `,
                width: 600,
                confirmButtonText: 'Tutup',
            });
        } catch (error) {
            pushError('Gagal memuat detail instruktur', error.response?.data?.message ?? error.message);
        }
    };

    const disabledPrev = page <= 1;
    const disabledNext = page >= meta.last_page;

    const summary = useMemo(() => {
        if (!meta.total) return 'Belum ada instruktur.';
        return `${meta.total} instruktur • Halaman ${meta.current_page} dari ${meta.last_page}`;
    }, [meta]);

    return (
        <>
            <section className="surface">
                <div className="surface-header">
                    <div>
                        <div className="surface-title">Tim Instruktur</div>
                        <div className="surface-subtitle">
                            Kelola profil ahli, spesialisasi, dan penugasan kursus.
                        </div>
                    </div>
                    <div className="table-actions">
                        <button
                            type="button"
                            className="btn btn-ghost"
                            onClick={() => fetchInstructors(page)}
                        >
                            Segarkan
                        </button>
                        <button type="button" className="btn btn-primary" onClick={handleOpenCreate}>
                            + Tambah Instruktur
                        </button>
                    </div>
                </div>

                <div className="filters-row">
                    <input
                        type="search"
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        placeholder="Cari instruktur berdasarkan nama atau email..."
                    />
                </div>

                {loading ? (
                    <div className="empty-state">
                        <h2>Memuat tim instruktur...</h2>
                        <p>Seluruh mentor dan pengajar sedang kami tampilkan.</p>
                    </div>
                ) : instructors.length === 0 ? (
                    <div className="empty-state">
                        <h2>Belum ada instruktur</h2>
                        <p>
                            Tambahkan instruktur untuk membimbing peserta. Mereka dapat ditugaskan ke
                            banyak kursus.
                        </p>
                        <button type="button" className="btn btn-primary" onClick={handleOpenCreate}>
                            Undang Instruktur
                        </button>
                    </div>
                ) : (
                    <>
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Nama</th>
                                    <th>Spesialisasi</th>
                                    <th>Unit</th>
                                    <th>Kursus Dibina</th>
                                    <th>Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {instructors.map((instructor) => (
                                    <tr key={instructor.id}>
                                        <td>
                                            <div style={{ fontWeight: 600 }}>{instructor.name}</div>
                                            <div style={{ color: '#64748b', fontSize: '0.8rem' }}>
                                                {instructor.profile?.bio ?? 'Belum ada bio.'}
                                            </div>
                                        </td>
                                        <td>
                                            <span className="chip">
                                                {instructor.profile?.expertise ?? 'Belum ditentukan'}
                                            </span>
                                        </td>
                                        <td>{instructor.unit?.name ?? '-'}</td>
                                        <td>
                                            <div style={{ display: 'grid', gap: '0.35rem' }}>
                                                {(instructor.teaching_courses ?? []).slice(0, 3).map((course) => (
                                                    <span key={course.id} className="chip">
                                                        {course.title} • {course.status}
                                                    </span>
                                                ))}
                                                {(instructor.teaching_courses?.length ?? 0) > 3 ? (
                                                    <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                                                        +{instructor.teaching_courses.length - 3} kursus lainnya
                                                    </span>
                                                ) : null}
                                            </div>
                                        </td>
                                        <td>
                                            <div className="table-actions">
                                                <button
                                                    type="button"
                                                    className="btn btn-ghost btn-icon"
                                                    onClick={() => handlePreview(instructor)}
                                                    title="Lihat detail instruktur"
                                                >
                                                    <PreviewIcon />
                                                </button>
                                                <button
                                                    type="button"
                                                    className="btn btn-ghost btn-icon"
                                                    onClick={() => handleOpenEdit(instructor)}
                                                    title="Edit instruktur"
                                                >
                                                    <EditIcon />
                                                </button>
                                                <button
                                                    type="button"
                                                    className="btn btn-danger btn-icon"
                                                    onClick={() => handleDelete(instructor)}
                                                    title="Hapus instruktur"
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
                                    onClick={() => !disabledPrev && fetchInstructors(page - 1)}
                                >
                                    ‹ Sebelumnya
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-ghost"
                                    disabled={disabledNext}
                                    onClick={() => !disabledNext && fetchInstructors(page + 1)}
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
                title={editingInstructor ? 'Perbarui Instruktur' : 'Instruktur Baru'}
                description="Lengkapi profil instruktur beserta detail keahlian untuk meningkatkan kredibilitas pembelajaran."
                footer={
                    <>
                        <button type="button" className="btn btn-ghost" onClick={handleCloseModal}>
                            Batal
                        </button>
                        <button type="submit" form="instructor-form" className="btn btn-primary">
                            Simpan Profil
                        </button>
                    </>
                }
            >
                <form id="instructor-form" className="form-grid" onSubmit={handleSubmit}>
                    <div className="form-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.85rem' }}>
                        <div className="form-field">
                            <label htmlFor="name">Nama</label>
                            <input
                                id="name"
                                name="name"
                                value={form.name}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="form-field">
                            <label htmlFor="email">Email</label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                value={form.email}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>
                    <div className="form-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.85rem' }}>
                        <div className="form-field">
                            <label htmlFor="phone">Nomor Telepon</label>
                            <input id="phone" name="phone" value={form.phone} onChange={handleChange} />
                        </div>
                        <div className="form-field">
                            <label htmlFor="password">
                                Password {editingInstructor ? '(opsional)' : ''}
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                value={form.password}
                                onChange={handleChange}
                                required={!editingInstructor}
                                placeholder={editingInstructor ? 'Biarkan kosong jika tidak diubah' : ''}
                            />
                        </div>
                    </div>
                    <div className="form-field">
                        <label htmlFor="unit_id">Unit Penugasan</label>
                        <select
                            id="unit_id"
                            name="unit_id"
                            value={form.unit_id}
                            onChange={handleChange}
                        >
                            <option value="">Tanpa unit</option>
                            {units.map((unit) => (
                                <option key={unit.id} value={unit.id}>
                                    {unit.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="form-field">
                        <label htmlFor="expertise">Fokus Keahlian</label>
                        <input
                            id="expertise"
                            name="expertise"
                            value={form.expertise}
                            onChange={handleChange}
                            placeholder="Contoh: Data Science, UI/UX, Manajemen Proyek"
                        />
                    </div>
                    <div className="form-field">
                        <label htmlFor="bio">Bio Singkat</label>
                        <textarea
                            id="bio"
                            name="bio"
                            value={form.bio}
                            onChange={handleChange}
                            rows={4}
                        />
                    </div>
                    <div className="form-field">
                        <label htmlFor="linkedin">LinkedIn / Portofolio</label>
                        <input
                            id="linkedin"
                            name="linkedin"
                            type="url"
                            value={form.linkedin}
                            onChange={handleChange}
                            placeholder="https://linkedin.com/in/username"
                        />
                    </div>
                </form>
            </Modal>
        </>
    );
}
