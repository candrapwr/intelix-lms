import { useCallback, useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import client from '../api/client';
import Modal from '../components/Modal';
import { useNotification } from '../context/NotificationContext';

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

const emptyClassification = {
    name: '',
    slug: '',
    description: '',
    sort_order: 0,
    is_active: true,
};

function normalizePayload(form) {
    return {
        name: form.name,
        slug: form.slug || undefined,
        description: form.description || undefined,
        sort_order:
            form.sort_order === '' || Number.isNaN(Number(form.sort_order))
                ? undefined
                : Number(form.sort_order),
        is_active: Boolean(form.is_active),
    };
}

export default function CourseClassificationPage() {
    const [classifications, setClassifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [form, setForm] = useState(emptyClassification);
    const [editingClassification, setEditingClassification] = useState(null);

    const { pushError, pushSuccess } = useNotification();

    const fetchClassifications = useCallback(async () => {
        setLoading(true);
        try {
            const response = await client.get('/course-classifications');
            setClassifications(response.data.data ?? response.data ?? []);
        } catch (error) {
            pushError(
                'Gagal memuat klasifikasi',
                error.response?.data?.message ?? error.message,
            );
        } finally {
            setLoading(false);
        }
    }, [pushError]);

    useEffect(() => {
        fetchClassifications();
    }, [fetchClassifications]);

    const handleOpenCreate = () => {
        setEditingClassification(null);
        setForm(emptyClassification);
        setModalOpen(true);
    };

    const handleOpenEdit = (classification) => {
        setEditingClassification(classification);
        setForm({
            name: classification.name ?? '',
            slug: classification.slug ?? '',
            description: classification.description ?? '',
            sort_order:
                classification.sort_order === null || classification.sort_order === undefined
                    ? ''
                    : classification.sort_order,
            is_active: classification.is_active ?? true,
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
            if (editingClassification) {
                await client.patch(`/course-classifications/${editingClassification.id}`, payload);
                pushSuccess('Klasifikasi diperbarui', 'Data klasifikasi berhasil disimpan.');
            } else {
                await client.post('/course-classifications', payload);
                pushSuccess('Klasifikasi dibuat', 'Klasifikasi baru berhasil ditambahkan.');
            }
            handleCloseModal();
            fetchClassifications();
        } catch (error) {
            pushError(
                'Gagal menyimpan klasifikasi',
                error.response?.data?.message ?? error.message,
            );
        }
    };

    const handleDelete = async (classification) => {
        const result = await Swal.fire({
            title: 'Hapus klasifikasi?',
            text: `Klasifikasi "${classification.name}" akan dihapus.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            confirmButtonText: 'Hapus',
            cancelButtonText: 'Batal',
        });

        if (!result.isConfirmed) return;

        try {
            await client.delete(`/course-classifications/${classification.id}`);
            pushSuccess('Klasifikasi dihapus', 'Data klasifikasi berhasil dihapus.');
            fetchClassifications();
        } catch (error) {
            const message = error.response?.data?.message ?? error.message;
            pushError('Gagal menghapus klasifikasi', message);
        }
    };

    return (
        <div className="surface">
            <div className="surface-header">
                <div>
                    <div className="surface-title">Master Unit</div>
                    <div className="surface-subtitle">
                        Kelola klasifikasi kursus untuk mengelompokkan tingkat operasi, spesialisasi,
                        dan jalur pelatihan intelijen.
                    </div>
                </div>
                <button type="button" className="btn btn-primary" onClick={handleOpenCreate}>
                    Tambah Klasifikasi
                </button>
            </div>

            {loading ? (
                <div className="empty-state">
                    <h2>Memuat data klasifikasi...</h2>
                    <p>Tunggu sejenak, intel klasifikasi sedang dipanggil dari pusat data.</p>
                </div>
            ) : classifications.length === 0 ? (
                <div className="empty-state">
                    <h2>Belum ada klasifikasi</h2>
                    <p>
                        Buat klasifikasi kursus pertama Anda untuk membedakan jalur pelatihan dasar,
                        lanjutan, maupun spesialis.
                    </p>
                    <button type="button" className="btn btn-primary" onClick={handleOpenCreate}>
                        Tambah Klasifikasi
                    </button>
                </div>
            ) : (
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Nama</th>
                            <th>Slug</th>
                            <th>Deskripsi</th>
                            <th>Urutan</th>
                            <th>Status</th>
                            <th>Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {classifications.map((classification) => (
                            <tr key={classification.id}>
                                <td>{classification.name}</td>
                                <td>{classification.slug}</td>
                                <td>{classification.description || '-'}</td>
                                <td>{classification.sort_order ?? '-'}</td>
                                <td>
                                    <span
                                        className={`badge ${
                                            classification.is_active ? 'badge-success' : 'badge-warning'
                                        }`}
                                    >
                                        {classification.is_active ? 'Aktif' : 'Nonaktif'}
                                    </span>
                                </td>
                                <td>
                                    <div className="table-actions">
                                        <button
                                            type="button"
                                            className="btn btn-ghost btn-icon"
                                            onClick={() => handleOpenEdit(classification)}
                                            title="Edit klasifikasi"
                                        >
                                            <EditIcon />
                                        </button>
                                        <button
                                            type="button"
                                            className="btn btn-danger btn-icon"
                                            onClick={() => handleDelete(classification)}
                                            title="Hapus klasifikasi"
                                        >
                                            <DeleteIcon />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}

            <Modal
                title={editingClassification ? 'Edit Klasifikasi' : 'Tambah Klasifikasi'}
                isOpen={modalOpen}
                onClose={handleCloseModal}
                footer={
                    <>
                        <button type="button" className="btn btn-ghost" onClick={handleCloseModal}>
                            Batal
                        </button>
                        <button type="submit" form="classification-form" className="btn btn-primary">
                            Simpan
                        </button>
                    </>
                }
            >
                <form id="classification-form" className="form-grid" onSubmit={handleSubmit}>
                    <div className="form-field">
                        <label htmlFor="name">Nama klasifikasi</label>
                        <input
                            id="name"
                            name="name"
                            value={form.name}
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
                            placeholder="otomatis dari nama jika dikosongkan"
                        />
                    </div>
                    <div className="form-field">
                        <label htmlFor="description">Deskripsi</label>
                        <textarea
                            id="description"
                            name="description"
                            value={form.description}
                            onChange={handleChange}
                            rows={2}
                            placeholder="Gambaran singkat mengenai klasifikasi"
                        />
                    </div>
                    <div className="form-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0.6rem' }}>
                        <div className="form-field">
                            <label htmlFor="sort_order">Urutan</label>
                            <input
                                id="sort_order"
                                name="sort_order"
                                type="number"
                                min="0"
                                value={form.sort_order}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="form-field checkbox-field">
                            <label htmlFor="is_active" style={{ fontSize: '0.8rem' }}>
                                <input
                                    id="is_active"
                                    name="is_active"
                                    type="checkbox"
                                    checked={Boolean(form.is_active)}
                                    onChange={handleChange}
                                />
                                Aktifkan klasifikasi
                            </label>
                        </div>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
