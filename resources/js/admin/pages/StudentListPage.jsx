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

const emptyStudent = {
    name: '',
    email: '',
    phone: '',
    password: '',
    timezone: '',
    goal: '',
    unit_id: '',
    sub_unit_id: '',
};

function buildStudentPayload(form, isUpdate = false) {
    const payload = {
        name: form.name,
        email: form.email,
        phone: form.phone || undefined,
        unit_id: form.unit_id ? Number(form.unit_id) : null,
        sub_unit_id: form.sub_unit_id ? Number(form.sub_unit_id) : null,
    };

    const profile = {
        timezone: form.timezone || undefined,
        goal: form.goal || undefined,
    };

    if (profile.timezone || profile.goal) {
        payload.profile = profile;
    }

    if (!isUpdate || form.password) {
        payload.password = form.password;
    }

    return payload;
}

export default function StudentListPage() {
    const [students, setStudents] = useState([]);
    const [meta, setMeta] = useState({ current_page: 1, last_page: 1, total: 0 });
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const debouncedSearch = useDebounce(search);

    const [units, setUnits] = useState([]);
    const [subUnits, setSubUnits] = useState([]);
    const [unitFilter, setUnitFilter] = useState('');
    const [subUnitFilter, setSubUnitFilter] = useState('');

    const [modalOpen, setModalOpen] = useState(false);
    const [form, setForm] = useState(emptyStudent);
    const [editingStudent, setEditingStudent] = useState(null);

    const { pushError, pushSuccess } = useNotification();

    const filteredSubUnits = useMemo(() => {
        if (!form.unit_id) {
            return subUnits;
        }
        const unitId = Number(form.unit_id);
        return subUnits.filter((item) => item.unit_id === unitId);
    }, [form.unit_id, subUnits]);

    const filterSubUnits = useMemo(() => {
        if (!unitFilter) {
            return subUnits;
        }
        const unitId = Number(unitFilter);
        return subUnits.filter((item) => item.unit_id === unitId);
    }, [subUnits, unitFilter]);

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
            pushError('Gagal memuat data unit', error.response?.data?.message ?? error.message);
        }
    }, [pushError]);

    const loadSubUnits = useCallback(async () => {
        try {
            const response = await client.get('/sub-units', {
                params: {
                    per_page: 500,
                    is_active: true,
                },
            });
            setSubUnits(response.data.data ?? []);
        } catch (error) {
            pushError('Gagal memuat data sub unit', error.response?.data?.message ?? error.message);
        }
    }, [pushError]);

    useEffect(() => {
        loadUnits();
        loadSubUnits();
    }, [loadUnits, loadSubUnits]);

    const fetchStudents = useCallback(
        async (pageNumber = 1) => {
            setLoading(true);
            try {
                const response = await client.get('/students', {
                    params: {
                        page: pageNumber,
                        per_page: 15,
                        search: debouncedSearch || undefined,
                        unit_id: unitFilter || undefined,
                        sub_unit_id: subUnitFilter || undefined,
                    },
                });
                const metaResponse = response.data.meta;
                setStudents(response.data.data);
                setMeta(metaResponse);
                setPage(metaResponse.current_page);
            } catch (error) {
                pushError('Gagal memuat siswa', error.response?.data?.message ?? error.message);
            } finally {
                setLoading(false);
            }
        },
        [debouncedSearch, pushError, unitFilter, subUnitFilter],
    );

    useEffect(() => {
        setPage(1);
        fetchStudents(1);
    }, [debouncedSearch, unitFilter, subUnitFilter, fetchStudents]);

    useEffect(() => {
        setSubUnitFilter('');
    }, [unitFilter]);

    const handleOpenCreate = () => {
        setEditingStudent(null);
        setForm(emptyStudent);
        setModalOpen(true);
    };

    const handleOpenEdit = (student) => {
        setEditingStudent(student);
        setForm({
            name: student.name ?? '',
            email: student.email ?? '',
            phone: student.phone ?? '',
            password: '',
            timezone: student.profile?.timezone ?? '',
            goal: student.profile?.goal ?? '',
            unit_id: student.unit?.id ?? student.unit_id ?? '',
            sub_unit_id: student.sub_unit?.id ?? student.sub_unit_id ?? '',
        });
        setModalOpen(true);
    };

    const handleCloseModal = () => {
        setModalOpen(false);
    };

    const handleChange = (event) => {
        const { name, value } = event.target;

        setForm((prev) => {
            if (name === 'unit_id') {
                return {
                    ...prev,
                    unit_id: value,
                    sub_unit_id: '',
                };
            }

            return {
                ...prev,
                [name]: value,
            };
        });
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        const payload = buildStudentPayload(form, Boolean(editingStudent));

        try {
            if (editingStudent) {
                await client.patch(`/students/${editingStudent.id}`, payload);
                pushSuccess('Data siswa diperbarui', 'Perubahan telah disimpan.');
            } else {
                await client.post('/students', payload);
                pushSuccess('Siswa baru ditambahkan', 'Siswa telah menerima undangan belajar.');
            }
            handleCloseModal();
            fetchStudents(page);
        } catch (error) {
            pushError('Gagal menyimpan siswa', error.response?.data?.message ?? error.message);
        }
    };

    const handleDelete = async (student) => {
        const result = await Swal.fire({
            title: 'Hapus akun siswa?',
            text: `Akun "${student.name}" dan riwayat enrollment terkait akan dihapus.`,
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
            await client.delete(`/students/${student.id}`);
            pushSuccess('Siswa dihapus', 'Akun siswa berhasil dihapus.');
            fetchStudents(page);
        } catch (error) {
            pushError('Gagal menghapus siswa', error.response?.data?.message ?? error.message);
        }
    };

    const handlePreview = async (student) => {
        try {
            const response = await client.get(`/students/${student.id}`);
            const detail = response.data.data ?? response.data;

            const enrollmentsList = (detail.enrollments ?? [])
                .map((enrollment) => `<li>${escapeHtml(enrollment.course?.title ?? '-')}</li>`)
                .join('');

            Swal.fire({
                title: detail.name,
                html: `
                    <div style="text-align:left;display:grid;gap:0.6rem;font-size:0.92rem">
                        <div><strong>Email:</strong> ${escapeHtml(detail.email)}</div>
                        <div><strong>Telepon:</strong> ${escapeHtml(detail.phone ?? '-')}</div>
                        <div><strong>Unit:</strong> ${escapeHtml(detail.unit?.name ?? '-')}</div>
                        <div><strong>Sub Unit:</strong> ${escapeHtml(detail.sub_unit?.name ?? '-')}</div>
                        <div><strong>Zona waktu:</strong> ${escapeHtml(detail.profile?.timezone ?? '-')}</div>
                        <div><strong>Tujuan belajar:</strong><br>${escapeHtml(detail.profile?.goal ?? 'Belum diisi.')}</div>
                        <div><strong>Kursus diikuti:</strong> ${detail.meta?.enrollments ?? 0}</div>
                        ${enrollmentsList ? `<div><ul style="padding-left:1.25rem;margin:0">${enrollmentsList}</ul></div>` : ''}
                    </div>
                `,
                width: 600,
                confirmButtonText: 'Tutup',
            });
        } catch (error) {
            pushError('Gagal memuat detail siswa', error.response?.data?.message ?? error.message);
        }
    };

    const disabledPrev = page <= 1;
    const disabledNext = page >= meta.last_page;

    const summary = useMemo(() => {
        if (!meta.total) return 'Belum ada siswa terdaftar.';
        return `${meta.total} siswa • Halaman ${meta.current_page} dari ${meta.last_page}`;
    }, [meta]);

    return (
        <>
            <section className="surface">
                <div className="surface-header">
                    <div>
                        <div className="surface-title">Daftar Siswa</div>
                        <div className="surface-subtitle">
                            Pantau status belajar, histori enrollment, dan informasi kontak.
                        </div>
                    </div>
                    <div className="table-actions">
                        <button type="button" className="btn btn-ghost" onClick={() => fetchStudents(page)}>
                            Refresh
                        </button>
                        <button type="button" className="btn btn-primary" onClick={handleOpenCreate}>
                            + Tambah Siswa
                        </button>
                    </div>
                </div>

                <div className="filters-row">
                    <input
                        type="search"
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        placeholder="Cari nama atau email..."
                    />
                    <select
                        value={unitFilter}
                        onChange={(event) => setUnitFilter(event.target.value)}
                    >
                        <option value="">Semua unit</option>
                        {units.map((unit) => (
                            <option key={unit.id} value={unit.id}>
                                {unit.name}
                            </option>
                        ))}
                    </select>
                    <select
                        value={subUnitFilter}
                        onChange={(event) => setSubUnitFilter(event.target.value)}
                        disabled={!unitFilter}
                    >
                        <option value="">Semua sub unit</option>
                        {filterSubUnits.map((subUnit) => (
                            <option key={subUnit.id} value={subUnit.id}>
                                {subUnit.name}
                            </option>
                        ))}
                    </select>
                </div>

                {loading ? (
                    <div className="empty-state">
                        <h2>Memuat daftar siswa...</h2>
                        <p>Kami sedang menyiapkan informasi peserta platform Anda.</p>
                    </div>
                ) : students.length === 0 ? (
                    <div className="empty-state">
                        <h2>Belum ada siswa</h2>
                        <p>
                            Undang siswa pertama Anda untuk mengikuti kursus. Data progres akan muncul di
                            sini.
                        </p>
                        <button type="button" className="btn btn-primary" onClick={handleOpenCreate}>
                            Undang Siswa
                        </button>
                    </div>
                ) : (
                    <>
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Nama</th>
                                    <th>Email</th>
                                    <th>Unit</th>
                                    <th>Sub Unit</th>
                                    <th>Kursus Aktif</th>
                                    <th>Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {students.map((student) => (
                                    <tr key={student.id}>
                                        <td>
                                            <div style={{ fontWeight: 600 }}>{student.name}</div>
                                            <div style={{ color: '#64748b', fontSize: '0.78rem' }}>
                                                {student.profile?.goal ?? 'Belum ada catatan tujuan.'}
                                            </div>
                                        </td>
                                        <td>{student.email}</td>
                                        <td>{student.unit?.name ?? '-'}</td>
                                        <td>{student.sub_unit?.name ?? '-'}</td>
                                        <td>{student.meta?.enrollments ?? 0}</td>
                                        <td>
                                            <div className="table-actions">
                                                <button
                                                    type="button"
                                                    className="btn btn-ghost btn-icon"
                                                    onClick={() => handlePreview(student)}
                                                    title="Lihat detail siswa"
                                                >
                                                    <PreviewIcon />
                                                </button>
                                                <button
                                                    type="button"
                                                    className="btn btn-ghost btn-icon"
                                                    onClick={() => handleOpenEdit(student)}
                                                    title="Edit siswa"
                                                >
                                                    <EditIcon />
                                                </button>
                                                <button
                                                    type="button"
                                                    className="btn btn-danger btn-icon"
                                                    onClick={() => handleDelete(student)}
                                                    title="Hapus siswa"
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
                                    onClick={() => !disabledPrev && fetchStudents(page - 1)}
                                >
                                    ‹ Sebelumnya
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-ghost"
                                    disabled={disabledNext}
                                    onClick={() => !disabledNext && fetchStudents(page + 1)}
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
                title={editingStudent ? 'Perbarui Siswa' : 'Siswa Baru'}
                description="Isi identitas peserta dan kredensial awal. Password dapat diubah sewaktu-waktu."
                footer={
                    <>
                        <button type="button" className="btn btn-ghost" onClick={handleCloseModal}>
                            Batal
                        </button>
                        <button type="submit" form="student-form" className="btn btn-primary">
                            Simpan Siswa
                        </button>
                    </>
                }
            >
                <form id="student-form" className="form-grid" onSubmit={handleSubmit}>
                    <div className="form-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.6rem' }}>
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
                    <div className="form-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.6rem' }}>
                        <div className="form-field">
                            <label htmlFor="phone">Nomor Telepon</label>
                            <input id="phone" name="phone" value={form.phone} onChange={handleChange} />
                        </div>
                        <div className="form-field">
                            <label htmlFor="password">
                                Password {editingStudent ? '(isi jika ingin reset)' : ''}
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                value={form.password}
                                onChange={handleChange}
                                required={!editingStudent}
                                placeholder={editingStudent ? 'Biarkan kosong jika tidak diubah' : ''}
                            />
                        </div>
                    </div>
                    <div className="form-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.6rem' }}>
                        <div className="form-field">
                            <label htmlFor="unit_id">Unit</label>
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
                            <label htmlFor="sub_unit_id">Sub Unit</label>
                            <select
                                id="sub_unit_id"
                                name="sub_unit_id"
                                value={form.sub_unit_id}
                                onChange={handleChange}
                                disabled={!form.unit_id}
                            >
                                <option value="">Tanpa sub unit</option>
                                {filteredSubUnits.map((subUnit) => (
                                    <option key={subUnit.id} value={subUnit.id}>
                                        {subUnit.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div className="form-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.6rem' }}>
                        <div className="form-field">
                            <label htmlFor="timezone">Zona Waktu (Opsional)</label>
                            <input
                                id="timezone"
                                name="timezone"
                                value={form.timezone}
                                onChange={handleChange}
                                placeholder="Misal: Asia/Jakarta"
                            />
                        </div>
                        <div className="form-field">
                            <label htmlFor="goal">Tujuan Belajar</label>
                            <input
                                id="goal"
                                name="goal"
                                value={form.goal}
                                onChange={handleChange}
                                placeholder="Ringkasan tujuan personal"
                            />
                        </div>
                    </div>
                </form>
            </Modal>
        </>
    );
}
