import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Swal from 'sweetalert2';
import client from '../api/client';
import Modal from '../components/Modal';
import { useNotification } from '../context/NotificationContext';

const SectionIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" width="24" height="24">
        <path d="M4 4h16v4H4z" />
        <path d="M4 10h10v4H4z" />
        <path d="M4 16h16v4H4z" />
    </svg>
);

const FileIcon = () => (
    <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        width="20"
        height="20"
        style={{ minWidth: 20 }}
    >
        <path d="M6 2h7l5 5v13a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z" />
        <path d="M13 2v6h6" />
    </svg>
);

const DownloadIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" width="20" height="20">
        <path d="M12 3v12" strokeLinecap="round" />
        <path d="m7 11 5 5 5-5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M4 19h16" strokeLinecap="round" />
    </svg>
);

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

export default function CourseSectionsPage() {
    const { slug } = useParams();
    const navigate = useNavigate();
    const { pushError, pushSuccess } = useNotification();

    const [loading, setLoading] = useState(true);
    const [course, setCourse] = useState(null);
    const [sections, setSections] = useState([]);

    const [sectionModalOpen, setSectionModalOpen] = useState(false);
    const [sectionForm, setSectionForm] = useState(emptySection);
    const [editingSection, setEditingSection] = useState(null);

    const [materialModalOpen, setMaterialModalOpen] = useState(false);
    const [materialForm, setMaterialForm] = useState(emptyMaterial);
    const [materialSection, setMaterialSection] = useState(null);
    const [editingMaterial, setEditingMaterial] = useState(null);

    const fetchCourse = useCallback(async () => {
        setLoading(true);
        try {
            const response = await client.get(`/courses/${slug}`);
            const detail = response.data.data ?? response.data;
            setCourse(detail);
            setSections(detail.sections ?? []);
        } catch (error) {
            pushError(
                'Gagal memuat kursus',
                error.response?.data?.message ?? error.message ?? 'Terjadi kesalahan.',
            );
            navigate('/courses', { replace: true });
        } finally {
            setLoading(false);
        }
    }, [slug, navigate, pushError]);

    useEffect(() => {
        fetchCourse();
    }, [fetchCourse]);

    const handleOpenCreateSection = () => {
        setEditingSection(null);
        setSectionForm(emptySection);
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

    const handleSectionFormChange = (event) => {
        const { name, value } = event.target;
        setSectionForm((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSaveSection = async (event) => {
        event.preventDefault();
        const payload = normalizeSectionPayload(sectionForm);
        try {
            if (editingSection) {
                await client.patch(`/sections/${editingSection.id}`, payload);
                pushSuccess('Section diperbarui', 'Data section berhasil disimpan.');
            } else {
                await client.post(`/courses/${course.slug}/sections`, payload);
                pushSuccess('Section dibuat', 'Section baru berhasil ditambahkan.');
            }
            setSectionModalOpen(false);
            fetchCourse();
        } catch (error) {
            pushError(
                'Gagal menyimpan section',
                error.response?.data?.message ?? error.message ?? 'Terjadi kesalahan.',
            );
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
            await client.delete(`/sections/${section.id}`);
            pushSuccess('Section dihapus', 'Section berhasil dihapus.');
            fetchCourse();
        } catch (error) {
            pushError(
                'Gagal menghapus section',
                error.response?.data?.message ?? error.message ?? 'Terjadi kesalahan.',
            );
        }
    };

    const handleOpenMaterialModal = (section, material = null) => {
        setMaterialSection(section);
        setEditingMaterial(material);
        setMaterialForm({
            title: material?.title ?? '',
            description: material?.description ?? '',
            sort_order:
                material?.sort_order === null || material?.sort_order === undefined
                    ? ''
                    : material.sort_order,
            file: null,
        });
        setMaterialModalOpen(true);
    };

    const handleMaterialInputChange = (event) => {
        const { name, value, files } = event.target;
        if (name === 'file') {
            setMaterialForm((prev) => ({
                ...prev,
                file: files?.[0] ?? null,
            }));
            return;
        }

        setMaterialForm((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSaveMaterial = async (event) => {
        event.preventDefault();
        if (!materialSection) {
            pushError('Tidak ada section', 'Pilih section sebelum menambahkan materi.');
            return;
        }

        if (!editingMaterial && !materialForm.file) {
            pushError('File diperlukan', 'Pilih file materi sebelum menyimpan.');
            return;
        }

        const formData = new FormData();
        if (materialForm.title) formData.append('title', materialForm.title);
        if (materialForm.description) formData.append('description', materialForm.description);
        if (materialForm.sort_order !== '' && !Number.isNaN(Number(materialForm.sort_order))) {
            formData.append('sort_order', materialForm.sort_order);
        }
        if (materialForm.file) {
            formData.append('file', materialForm.file);
        }

        try {
            if (editingMaterial) {
                formData.append('_method', 'PATCH');
                await client.post(`/materials/${editingMaterial.id}`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
                pushSuccess('Materi diperbarui', 'Data materi berhasil disimpan.');
            } else {
                await client.post(`/sections/${materialSection.id}/materials`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
                pushSuccess('Materi dibuat', 'Materi baru berhasil ditambahkan.');
            }
            setMaterialModalOpen(false);
            fetchCourse();
        } catch (error) {
            pushError(
                'Gagal menyimpan materi',
                error.response?.data?.message ?? error.message ?? 'Terjadi kesalahan.',
            );
        }
    };

    const handleDeleteMaterial = async (material) => {
        const result = await Swal.fire({
            title: 'Hapus materi?',
            text: `Materi "${material.title}" akan dihapus.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#94a3b8',
            confirmButtonText: 'Hapus',
            cancelButtonText: 'Batal',
        });

        if (!result.isConfirmed) return;

        try {
            await client.delete(`/materials/${material.id}`);
            pushSuccess('Materi dihapus', 'Materi berhasil dihapus.');
            fetchCourse();
        } catch (error) {
            pushError(
                'Gagal menghapus materi',
                error.response?.data?.message ?? error.message ?? 'Terjadi kesalahan.',
            );
        }
    };

    const sectionsSummary = useMemo(() => {
        if (!sections.length) return 'Belum ada section pada kursus ini.';
        return `${sections.length} section`;
    }, [sections]);

    return (
        <>
            <button
                type="button"
                className="btn btn-ghost"
                onClick={() => navigate(-1)}
                style={{ marginBottom: '0.6rem' }}
            >
                ‹ Kembali
            </button>
            <div className="surface">
                <div className="surface-header" style={{ alignItems: 'center' }}>
                    <div>
                        <div className="surface-title" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <SectionIcon />
                            <span>Section Kursus</span>
                        </div>
                        <div className="surface-subtitle">
                            Kelola struktur materi untuk kursus <strong>{course?.title ?? ''}</strong>.{' '}
                            {sectionsSummary}
                        </div>
                    </div>
                    <button type="button" className="btn btn-primary" onClick={handleOpenCreateSection}>
                        Tambah Section
                    </button>
                </div>

            {loading ? (
                <div className="empty-state">
                    <h2>Memuat detail kursus...</h2>
                    <p>Mohon tunggu, data kursus sedang dipanggil dari server.</p>
                </div>
            ) : !sections.length ? (
                <div className="empty-state">
                    <h2>Belum ada section</h2>
                    <p>
                        Tambahkan section pertama untuk membagi materi kursus menjadi bagian-bagian
                        terstruktur.
                    </p>
                    <button type="button" className="btn btn-primary" onClick={handleOpenCreateSection}>
                        Tambah Section
                    </button>
                </div>
            ) : (
                <div style={{ display: 'grid', gap: '1rem' }}>
                    {sections.map((section) => (
                        <div
                            key={section.id}
                            className="surface-minor"
                            style={{ display: 'grid', gap: '0.8rem' }}
                        >
                            <div
                                style={{
                                    display: 'flex',
                                    alignItems: 'flex-start',
                                    justifyContent: 'space-between',
                                    gap: '0.8rem',
                                }}
                            >
                                <div style={{ display: 'grid', gap: '0.25rem' }}>
                                    <div style={{ fontWeight: 600, fontSize: '0.95rem', color: '#0f172a' }}>
                                        {section.title}{' '}
                                        {section.sort_order !== null && section.sort_order !== undefined ? (
                                            <span className="chip">Urutan {section.sort_order}</span>
                                        ) : null}
                                    </div>
                                    <div className="surface-subtitle">
                                        {section.summary || 'Belum ada ringkasan section.'}
                                    </div>
                                </div>
                                <div className="table-actions">
                                    <button
                                        type="button"
                                        className="btn btn-ghost btn-icon"
                                        onClick={() => handleOpenMaterialModal(section)}
                                        title="Tambah materi"
                                    >
                                        <FileIcon />
                                    </button>
                                    <button
                                        type="button"
                                        className="btn btn-ghost btn-icon"
                                        onClick={() => handleOpenEditSection(section)}
                                        title="Edit section"
                                    >
                                        <EditIcon />
                                    </button>
                                    <button
                                        type="button"
                                        className="btn btn-danger btn-icon"
                                        onClick={() => handleDeleteSection(section)}
                                        title="Hapus section"
                                    >
                                        <DeleteIcon />
                                    </button>
                                </div>
                            </div>
                            <div>
                                {section.materials?.length ? (
                                    <div style={{ display: 'grid', gap: '0.8rem' }}>
                                        {section.materials.map((material) => (
                                            <div
                                                key={material.id}
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'flex-start',
                                                    justifyContent: 'space-between',
                                                    gap: '0.8rem',
                                                    padding: '0.75rem',
                                                    borderRadius: '0.6rem',
                                                    border: '1px solid rgba(148, 163, 184, 0.25)',
                                                    background: 'rgba(248, 250, 252, 0.7)',
                                                }}
                                            >
                                                <div style={{ display: 'grid', gap: '0.3rem', flex: 1 }}>
                                                    <div
                                                        style={{
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '0.4rem',
                                                            fontWeight: 600,
                                                            color: '#0f172a',
                                                        }}
                                                    >
                                                        <FileIcon />{' '}
                                                        <span>{material.title ?? material.file_name}</span>
                                                    </div>
                                                    <div
                                                        style={{
                                                            display: 'flex',
                                                            flexWrap: 'wrap',
                                                            gap: '0.3rem',
                                                            fontSize: '0.75rem',
                                                            color: '#64748b',
                                                        }}
                                                    >
                                                        <span>{material.file_name}</span>
                                                        <span>•</span>
                                                        <span>{formatFileSize(material.file_size)}</span>
                                                        {material.sort_order !== null &&
                                                        material.sort_order !== undefined ? (
                                                            <>
                                                                <span>•</span>
                                                                <span>Urutan {material.sort_order}</span>
                                                            </>
                                                        ) : null}
                                                    </div>
                                                        {material.description ? (
                                                        <div style={{ fontSize: '0.8rem', color: '#475569' }}>
                                                            {material.description}
                                                        </div>
                                                    ) : null}
                                                </div>
                                                <div className="table-actions" style={{ alignSelf: 'center' }}>
                                                    {material.file_url ? (
                                                        <a
                                                            href={material.file_url}
                                                            className="btn btn-ghost btn-icon"
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            title="Unduh materi"
                                                        >
                                                            <DownloadIcon />
                                                        </a>
                                                    ) : null}
                                                    <button
                                                        type="button"
                                                        className="btn btn-ghost btn-icon"
                                                        onClick={() => handleOpenMaterialModal(section, material)}
                                                        title="Edit materi"
                                                    >
                                                        <EditIcon />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className="btn btn-danger btn-icon"
                                                        onClick={() => handleDeleteMaterial(material)}
                                                        title="Hapus materi"
                                                    >
                                                        <DeleteIcon />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div
                                        style={{
                                            display: 'grid',
                                            gap: '0.4rem',
                                            textAlign: 'center',
                                            padding: '0.8rem',
                                            borderRadius: '0.6rem',
                                            border: '1px dashed rgba(148, 163, 184, 0.4)',
                                            background: 'rgba(226, 232, 240, 0.2)',
                                        }}
                                    >
                                        <p>Belum ada materi pada section ini.</p>
                                        <button
                                            type="button"
                                            className="btn btn-ghost"
                                            onClick={() => handleOpenMaterialModal(section)}
                                        >
                                            Tambah Materi
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            </div>

            <Modal
                open={sectionModalOpen}
                onClose={() => setSectionModalOpen(false)}
                title={editingSection ? 'Edit Section' : 'Section Baru'}
                footer={
                    <>
                        <button type="button" className="btn btn-ghost" onClick={() => setSectionModalOpen(false)}>
                            Batal
                        </button>
                        <button type="submit" form="section-form" className="btn btn-primary">
                            Simpan Section
                        </button>
                    </>
                }
            >
                <form id="section-form" className="form-grid" onSubmit={handleSaveSection}>
                    <div className="form-field">
                        <label htmlFor="section-title">Judul Section</label>
                        <input
                            id="section-title"
                            name="title"
                            value={sectionForm.title}
                            onChange={handleSectionFormChange}
                            required
                        />
                    </div>
                    <div className="form-field">
                        <label htmlFor="section-summary">Ringkasan</label>
                        <textarea
                            id="section-summary"
                            name="summary"
                            rows={3}
                            value={sectionForm.summary}
                            onChange={handleSectionFormChange}
                            placeholder="Deskripsi singkat materi pada section ini"
                        />
                    </div>
                    <div className="form-field">
                        <label htmlFor="section-order">Urutan</label>
                        <input
                            id="section-order"
                            name="sort_order"
                            type="number"
                            min="0"
                            value={sectionForm.sort_order}
                            onChange={handleSectionFormChange}
                        />
                    </div>
                </form>
            </Modal>

            <Modal
                open={materialModalOpen}
                onClose={() => setMaterialModalOpen(false)}
                title={editingMaterial ? 'Edit Materi' : 'Materi Baru'}
                description={
                    materialSection
                        ? `Section: ${materialSection.title}`
                        : 'Pilih section untuk menambahkan materi.'
                }
                footer={
                    <>
                        <button type="button" className="btn btn-ghost" onClick={() => setMaterialModalOpen(false)}>
                            Batal
                        </button>
                        <button type="submit" form="material-form" className="btn btn-primary">
                            Simpan Materi
                        </button>
                    </>
                }
            >
                <form id="material-form" className="form-grid" onSubmit={handleSaveMaterial}>
                    <div className="form-field">
                        <label htmlFor="material-title">Judul Materi</label>
                        <input
                            id="material-title"
                            name="title"
                            value={materialForm.title}
                            onChange={handleMaterialInputChange}
                            placeholder="Opsional, otomatis memakai nama file bila dikosongkan"
                        />
                    </div>
                    <div className="form-field">
                        <label htmlFor="material-description">Deskripsi</label>
                        <textarea
                            id="material-description"
                            name="description"
                            rows={3}
                            value={materialForm.description}
                            onChange={handleMaterialInputChange}
                            placeholder="Tambahkan catatan singkat mengenai materi"
                        />
                    </div>
                    <div className="form-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.6rem' }}>
                        <div className="form-field">
                            <label htmlFor="material-sort">Urutan</label>
                            <input
                                id="material-sort"
                                name="sort_order"
                                type="number"
                                min="0"
                                value={materialForm.sort_order}
                                onChange={handleMaterialInputChange}
                            />
                        </div>
                        <div className="form-field">
                            <label htmlFor="material-file">
                                File Materi {editingMaterial ? '(kosongkan bila tidak diganti)' : ''}
                            </label>
                            <input
                                id="material-file"
                                name="file"
                                type="file"
                                accept=".pdf,.mp4,.mov,.mkv,.ppt,.pptx,.doc,.docx,.xls,.xlsx,video/*,application/pdf"
                                onChange={handleMaterialInputChange}
                            />
                        </div>
                    </div>
                    {editingMaterial ? (
                        <p style={{ fontSize: '0.78rem', color: '#64748b' }}>
                            File saat ini: <strong>{editingMaterial.file_name}</strong> (
                            {formatFileSize(editingMaterial.file_size)})
                        </p>
                    ) : null}
                </form>
            </Modal>
        </>
    );
}
