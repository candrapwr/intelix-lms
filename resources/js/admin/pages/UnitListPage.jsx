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

const emptyUnit = {
    name: '',
    code: '',
    description: '',
    is_active: true,
};

function normalizeUnitPayload(form) {
    return {
        name: form.name,
        code: form.code || undefined,
        description: form.description || undefined,
        is_active: Boolean(form.is_active),
    };
}

export default function UnitListPage() {
    const [units, setUnits] = useState([]);
    const [meta, setMeta] = useState({ current_page: 1, last_page: 1, total: 0 });
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [filters, setFilters] = useState({ search: '', status: '' });
    const debouncedSearch = useDebounce(filters.search);

    const [modalOpen, setModalOpen] = useState(false);
    const [form, setForm] = useState(emptyUnit);
    const [editingUnit, setEditingUnit] = useState(null);

    const { pushError, pushSuccess } = useNotification();

    const fetchUnits = useCallback(
        async (pageNumber = 1) => {
            setLoading(true);
            try {
                const response = await client.get('/units', {
                    params: {
                        page: pageNumber,
                        per_page: 20,
                        search: debouncedSearch || undefined,
                        is_active:
                            filters.status === ''
                                ? undefined
                                : filters.status === 'active'
                                ? true
                                : false,
                    },
                });
                setUnits(response.data.data);
                const metaResponse = response.data.meta;
                setMeta(metaResponse);
                setPage(metaResponse.current_page);
            } catch (error) {
                pushError('Gagal memuat unit', error.response?.data?.message ?? error.message);
            } finally {
                setLoading(false);
            }
        },
        [debouncedSearch, filters.status, pushError],
    );

    useEffect(() => {
        setPage(1);
        fetchUnits(1);
    }, [debouncedSearch, filters.status, fetchUnits]);

    const handleOpenCreate = () => {
        setEditingUnit(null);
        setForm(emptyUnit);
        setModalOpen(true);
    };

    const handleOpenEdit = (unit) => {
        setEditingUnit(unit);
        setForm({
            name: unit.name ?? '',
            code: unit.code ?? '',
            description: unit.description ?? '',
            is_active: unit.is_active ?? true,
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
        const payload = normalizeUnitPayload(form);

        try {
            if (editingUnit) {
                await client.patch(`/units/${editingUnit.id}`, payload);
                pushSuccess('Unit diperbarui', 'Data unit berhasil disimpan.');
            } else {
                await client.post('/units', payload);
                pushSuccess('Unit dibuat', 'Unit baru berhasil ditambahkan.');
            }
            handleCloseModal();
            fetchUnits(page);
        } catch (error) {
            pushError('Gagal menyimpan unit', error.response?.data?.message ?? error.message);
        }
    };

    const handleDelete = async (unit) => {
        const result = await Swal.fire({
            title: 'Hapus unit?',
            text: `Unit "${unit.name}" dan data terkait akan dihapus.`,
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
            await client.delete(`/units/${unit.id}`);
            pushSuccess('Unit dihapus', 'Unit berhasil dihapus.');
            fetchUnits(page);
        } catch (error) {
            pushError('Gagal menghapus unit', error.response?.data?.message ?? error.message);
        }
    };

    const handlePreview = async (unit) => {
        try {
            const response = await client.get(`/units/${unit.id}`);
            const detail = response.data.data ?? response.data;

            const subUnitList = (detail.sub_units ?? [])
                .map((subUnit) => `<li>${escapeHtml(subUnit.name)}</li>`)
                .join('');

            Swal.fire({
                title: detail.name,
                html: `
                    <div style="text-align:left;display:grid;gap:0.6rem;font-size:0.92rem">
                        <div><strong>Kode:</strong> ${escapeHtml(detail.code ?? '-')}</div>
                        <div><strong>Status:</strong> ${detail.is_active ? 'Aktif' : 'Nonaktif'}</div>
                        <div><strong>Deskripsi:</strong><br>${escapeHtml(detail.description ?? 'Belum ada deskripsi.')}</div>
                        <div><strong>Jumlah Sub Unit:</strong> ${detail.meta?.sub_unit_count ?? 0}</div>
                        ${subUnitList ? `<div><ul style="padding-left:1.25rem;margin:0">${subUnitList}</ul></div>` : ''}
                    </div>
                `,
                width: 600,
                confirmButtonText: 'Tutup',
            });
        } catch (error) {
            pushError('Gagal memuat detail unit', error.response?.data?.message ?? error.message);
        }
    };

    const summary = useMemo(() => {
        if (!meta.total) return 'Belum ada unit terdaftar.';
        return `${meta.total} unit • Halaman ${meta.current_page} dari ${meta.last_page}`;
    }, [meta]);

    const disabledPrev = page <= 1;
    const disabledNext = page >= meta.last_page;

    return (
        <>
            <section className="surface">
                <div className="surface-header">
                    <div>
                        <div className="surface-title">Master Unit</div>
                        <div className="surface-subtitle">
                            Kelola unit lembaga pelatihan dan sub unit di bawahnya.
                        </div>
                    </div>
                    <div className="table-actions">
                        <button type="button" className="btn btn-ghost" onClick={() => fetchUnits(page)}>
                            Muat ulang
                        </button>
                        <button type="button" className="btn btn-primary" onClick={handleOpenCreate}>
                            + Unit Baru
                        </button>
                    </div>
                </div>

                <div className="filters-row">
                    <input
                        type="search"
                        placeholder="Cari nama atau kode unit..."
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
                        <option value="active">Aktif</option>
                        <option value="inactive">Nonaktif</option>
                    </select>
                </div>

                {loading ? (
                    <div className="empty-state">
                        <h2>Memuat daftar unit...</h2>
                        <p>Mohon tunggu sejenak, kami sedang menyiapkan data.</p>
                    </div>
                ) : units.length === 0 ? (
                    <div className="empty-state">
                        <h2>Belum ada unit</h2>
                        <p>Tambahkan unit untuk mengelompokkan peserta pelatihan.</p>
                        <button type="button" className="btn btn-primary" onClick={handleOpenCreate}>
                            Buat Unit
                        </button>
                    </div>
                ) : (
                    <>
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Nama</th>
                                    <th>Kode</th>
                                    <th>Sub Unit</th>
                                    <th>Status</th>
                                    <th>Dibuat</th>
                                    <th>Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {units.map((unit) => (
                                    <tr key={unit.id}>
                                        <td>
                                            <div style={{ fontWeight: 600 }}>{unit.name}</div>
                                            <div style={{ color: '#64748b', fontSize: '0.8rem' }}>
                                                {unit.description || 'Belum ada deskripsi.'}
                                            </div>
                                        </td>
                                        <td>{unit.code || '-'}</td>
                                        <td>
                                            <span className="chip">
                                                {unit.meta?.sub_unit_count ?? 0} sub unit
                                            </span>
                                        </td>
                                        <td>
                                            <span
                                                className={`badge ${
                                                    unit.is_active ? 'badge-success' : 'badge-warning'
                                                }`}
                                            >
                                                {unit.is_active ? 'Aktif' : 'Nonaktif'}
                                            </span>
                                        </td>
                                        <td>
                                            {unit.created_at
                                                ? new Date(unit.created_at).toLocaleDateString('id-ID')
                                                : '-'}
                                        </td>
                                        <td>
                                            <div className="table-actions">
                                                <button
                                                    type="button"
                                                    className="btn btn-ghost btn-icon"
                                                    onClick={() => handlePreview(unit)}
                                                    title="Lihat detail unit"
                                                >
                                                    <PreviewIcon />
                                                </button>
                                                <button
                                                    type="button"
                                                    className="btn btn-ghost btn-icon"
                                                    onClick={() => handleOpenEdit(unit)}
                                                    title="Edit unit"
                                                >
                                                    <EditIcon />
                                                </button>
                                                <button
                                                    type="button"
                                                    className="btn btn-danger btn-icon"
                                                    onClick={() => handleDelete(unit)}
                                                    title="Hapus unit"
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
                                    onClick={() => !disabledPrev && fetchUnits(page - 1)}
                                >
                                    ‹ Sebelumnya
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-ghost"
                                    disabled={disabledNext}
                                    onClick={() => !disabledNext && fetchUnits(page + 1)}
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
                title={editingUnit ? 'Perbarui Unit' : 'Unit Baru'}
                description="Unit membantu mengelompokkan peserta pelatihan berdasarkan divisi atau departemen."
                footer={
                    <>
                        <button type="button" className="btn btn-ghost" onClick={handleCloseModal}>
                            Batal
                        </button>
                        <button type="submit" form="unit-form" className="btn btn-primary">
                            Simpan Unit
                        </button>
                    </>
                }
            >
                <form id="unit-form" className="form-grid" onSubmit={handleSubmit}>
                    <div className="form-field">
                        <label htmlFor="name">Nama Unit</label>
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
                            placeholder="Misal: UNIT-A"
                        />
                    </div>
                    <div className="form-field">
                        <label htmlFor="description">Deskripsi</label>
                        <textarea
                            id="description"
                            name="description"
                            value={form.description}
                            onChange={handleChange}
                            rows={4}
                        />
                    </div>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
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
