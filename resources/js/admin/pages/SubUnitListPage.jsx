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

const emptySubUnit = {
    unit_id: '',
    name: '',
    code: '',
    description: '',
    is_active: true,
};

function normalizePayload(form) {
    return {
        unit_id: form.unit_id ? Number(form.unit_id) : null,
        name: form.name,
        code: form.code || undefined,
        description: form.description || undefined,
        is_active: Boolean(form.is_active),
    };
}

export default function SubUnitListPage() {
    const [subUnits, setSubUnits] = useState([]);
    const [meta, setMeta] = useState({ current_page: 1, last_page: 1, total: 0 });
    const [units, setUnits] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [filters, setFilters] = useState({ search: '', status: '', unit_id: '' });
    const debouncedSearch = useDebounce(filters.search);

    const [modalOpen, setModalOpen] = useState(false);
    const [form, setForm] = useState(emptySubUnit);
    const [editingSubUnit, setEditingSubUnit] = useState(null);

    const { pushError, pushSuccess } = useNotification();

    const loadUnits = useCallback(async () => {
        try {
            const response = await client.get('/units', {
                params: {
                    per_page: 100,
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

    const fetchSubUnits = useCallback(
        async (pageNumber = 1) => {
            setLoading(true);
            try {
                const response = await client.get('/sub-units', {
                    params: {
                        page: pageNumber,
                        per_page: 25,
                        search: debouncedSearch || undefined,
                        unit_id: filters.unit_id || undefined,
                        is_active:
                            filters.status === ''
                                ? undefined
                                : filters.status === 'active'
                                ? true
                                : false,
                    },
                });
                setSubUnits(response.data.data);
                const metaResponse = response.data.meta;
                setMeta(metaResponse);
                setPage(metaResponse.current_page);
            } catch (error) {
                pushError('Gagal memuat sub unit', error.response?.data?.message ?? error.message);
            } finally {
                setLoading(false);
            }
        },
        [debouncedSearch, filters.unit_id, filters.status, pushError],
    );

    useEffect(() => {
        setPage(1);
        fetchSubUnits(1);
    }, [debouncedSearch, filters.unit_id, filters.status, fetchSubUnits]);

    const handleOpenCreate = () => {
        setEditingSubUnit(null);
        setForm(emptySubUnit);
        setModalOpen(true);
    };

    const handleOpenEdit = (subUnit) => {
        setEditingSubUnit(subUnit);
        setForm({
            unit_id: subUnit.unit?.id ?? subUnit.unit_id ?? '',
            name: subUnit.name ?? '',
            code: subUnit.code ?? '',
            description: subUnit.description ?? '',
            is_active: subUnit.is_active ?? true,
        });
        setModalOpen(true);
    };

    const handleCloseModal = () => {
        setModalOpen(false);
    };

    const handleChange = (event) => {
        const { name, value, type, checked } = event.target;
        setForm((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        const payload = normalizePayload(form);

        try {
            if (editingSubUnit) {
                await client.patch(`/sub-units/${editingSubUnit.id}`, payload);
                pushSuccess('Sub unit diperbarui', 'Perubahan telah disimpan.');
            } else {
                await client.post('/sub-units', payload);
                pushSuccess('Sub unit ditambahkan', 'Sub unit baru berhasil dibuat.');
            }
            handleCloseModal();
            fetchSubUnits(page);
        } catch (error) {
            pushError('Gagal menyimpan sub unit', error.response?.data?.message ?? error.message);
        }
    };

    const handleDelete = async (subUnit) => {
        const result = await Swal.fire({
            title: 'Hapus sub unit?',
            text: `Sub unit "${subUnit.name}" akan dihapus.`,
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
            await client.delete(`/sub-units/${subUnit.id}`);
            pushSuccess('Sub unit dihapus', 'Data sub unit berhasil dihapus.');
            fetchSubUnits(page);
        } catch (error) {
            pushError('Gagal menghapus sub unit', error.response?.data?.message ?? error.message);
        }
    };

    const handlePreview = async (subUnit) => {
        try {
            const response = await client.get(`/sub-units/${subUnit.id}`);
            const detail = response.data.data ?? response.data;

            Swal.fire({
                title: detail.name,
                html: `
                    <div style="text-align:left;display:grid;gap:0.6rem;font-size:0.92rem">
                        <div><strong>Kode:</strong> ${escapeHtml(detail.code ?? '-')}</div>
                        <div><strong>Unit:</strong> ${escapeHtml(detail.unit?.name ?? '-')}</div>
                        <div><strong>Status:</strong> ${detail.is_active ? 'Aktif' : 'Nonaktif'}</div>
                        <div><strong>Deskripsi:</strong><br>${escapeHtml(detail.description ?? 'Belum ada deskripsi.')}</div>
                    </div>
                `,
                width: 580,
                confirmButtonText: 'Tutup',
            });
        } catch (error) {
            pushError('Gagal memuat detail sub unit', error.response?.data?.message ?? error.message);
        }
    };

    const summary = useMemo(() => {
        if (!meta.total) return 'Belum ada sub unit.';
        return `${meta.total} sub unit • Halaman ${meta.current_page} dari ${meta.last_page}`;
    }, [meta]);

    const disabledPrev = page <= 1;
    const disabledNext = page >= meta.last_page;

    return (
        <>
            <section className="surface">
                <div className="surface-header">
                    <div>
                        <div className="surface-title">Master Sub Unit</div>
                        <div className="surface-subtitle">
                            Susun sub unit untuk setiap unit agar pengelompokan peserta lebih detail.
                        </div>
                    </div>
                    <div className="table-actions">
                        <button type="button" className="btn btn-ghost" onClick={() => fetchSubUnits(page)}>
                            Muat ulang
                        </button>
                        <button type="button" className="btn btn-primary" onClick={handleOpenCreate}>
                            + Sub Unit Baru
                        </button>
                    </div>
                </div>

                <div className="filters-row">
                    <input
                        type="search"
                        placeholder="Cari nama atau kode sub unit..."
                        value={filters.search}
                        onChange={(event) =>
                            setFilters((prev) => ({ ...prev, search: event.target.value }))
                        }
                    />
                    <select
                        value={filters.unit_id}
                        onChange={(event) =>
                            setFilters((prev) => ({ ...prev, unit_id: event.target.value }))
                        }
                    >
                        <option value="">Semua unit</option>
                        {units.map((unit) => (
                            <option key={unit.id} value={unit.id}>
                                {unit.name}
                            </option>
                        ))}
                    </select>
                    <select
                        value={filters.status}
                        onChange={(event) =>
                            setFilters((prev) => ({ ...prev, status: event.target.value }))
                        }
                    >
                        <option value="">Semua status</option>
                        <option value="active">Aktif</option>
                        <option value="inactive">Nonaktif</option>
                    </select>
                </div>

                {loading ? (
                    <div className="empty-state">
                        <h2>Memuat sub unit...</h2>
                        <p>Mohon tunggu sejenak.</p>
                    </div>
                ) : subUnits.length === 0 ? (
                    <div className="empty-state">
                        <h2>Belum ada sub unit</h2>
                        <p>Tambahkan sub unit agar struktur organisasi pelatihan lebih detail.</p>
                        <button type="button" className="btn btn-primary" onClick={handleOpenCreate}>
                            Buat Sub Unit
                        </button>
                    </div>
                ) : (
                    <>
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Nama</th>
                                    <th>Kode</th>
                                    <th>Unit</th>
                                    <th>Status</th>
                                    <th>Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {subUnits.map((subUnit) => (
                                    <tr key={subUnit.id}>
                                        <td>
                                            <div style={{ fontWeight: 600 }}>{subUnit.name}</div>
                                            <div style={{ color: '#64748b', fontSize: '0.8rem' }}>
                                                {subUnit.description || 'Belum ada deskripsi.'}
                                            </div>
                                        </td>
                                        <td>{subUnit.code || '-'}</td>
                                        <td>{subUnit.unit?.name ?? '-'}</td>
                                        <td>
                                            <span
                                                className={`badge ${
                                                    subUnit.is_active ? 'badge-success' : 'badge-warning'
                                                }`}
                                            >
                                                {subUnit.is_active ? 'Aktif' : 'Nonaktif'}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="table-actions">
                                                <button
                                                    type="button"
                                                    className="btn btn-ghost btn-icon"
                                                    onClick={() => handlePreview(subUnit)}
                                                    title="Lihat detail sub unit"
                                                >
                                                    <PreviewIcon />
                                                </button>
                                                <button
                                                    type="button"
                                                    className="btn btn-ghost btn-icon"
                                                    onClick={() => handleOpenEdit(subUnit)}
                                                    title="Edit sub unit"
                                                >
                                                    <EditIcon />
                                                </button>
                                                <button
                                                    type="button"
                                                    className="btn btn-danger btn-icon"
                                                    onClick={() => handleDelete(subUnit)}
                                                    title="Hapus sub unit"
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
                                    onClick={() => !disabledPrev && fetchSubUnits(page - 1)}
                                >
                                    ‹ Sebelumnya
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-ghost"
                                    disabled={disabledNext}
                                    onClick={() => !disabledNext && fetchSubUnits(page + 1)}
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
                title={editingSubUnit ? 'Perbarui Sub Unit' : 'Sub Unit Baru'}
                description="Sub unit dapat merepresentasikan kelas, kelompok, atau tim di bawah unit utama."
                footer={
                    <>
                        <button type="button" className="btn btn-ghost" onClick={handleCloseModal}>
                            Batal
                        </button>
                        <button type="submit" form="subunit-form" className="btn btn-primary">
                            Simpan Sub Unit
                        </button>
                    </>
                }
            >
                <form id="subunit-form" className="form-grid" onSubmit={handleSubmit}>
                    <div className="form-field">
                        <label htmlFor="unit_id">Unit</label>
                        <select
                            id="unit_id"
                            name="unit_id"
                            value={form.unit_id}
                            onChange={handleChange}
                            required
                        >
                            <option value="">Pilih unit</option>
                            {units.map((unit) => (
                                <option key={unit.id} value={unit.id}>
                                    {unit.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="form-field">
                        <label htmlFor="name">Nama Sub Unit</label>
                        <input
                            id="name"
                            name="name"
                            value={form.name}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="form-field">
                        <label htmlFor="code">Kode (opsional)</label>
                        <input
                            id="code"
                            name="code"
                            value={form.code}
                            onChange={handleChange}
                            placeholder="Misal: SUB-1"
                        />
                    </div>
                    <div className="form-field">
                        <label htmlFor="description">Deskripsi</label>
                        <textarea
                            id="description"
                            name="description"
                            value={form.description}
                            onChange={handleChange}
                            rows={3}
                        />
                    </div>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem' }}>
                        <input
                            type="checkbox"
                            name="is_active"
                            checked={form.is_active}
                            onChange={handleChange}
                        />
                        Status aktif
                    </label>
                </form>
            </Modal>
        </>
    );
}
