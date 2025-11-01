import './instructor.css';

const cohorts = [
    {
        name: 'Task Force Orion',
        progress: 82,
        members: 32,
        highlight: 'Operative unggulan: Siti Rahma (92%)',
    },
    {
        name: 'Signals Cell Beta',
        progress: 61,
        members: 28,
        highlight: 'Perlu perhatian: 4 operative belum aktif',
    },
    {
        name: 'Shadow Unit Alpha',
        progress: 45,
        members: 24,
        highlight: 'Target berikut: Simulasi penyamaran tingkat lanjut',
    },
];

export default function InstructorStudentsPage() {
    return (
        <div className="instructor-page">
            <header className="section-header">
                <div>
                    <h1>Operative cells</h1>
                    <p>Rayakan capaian, temukan hambatan lapangan, dan pastikan komunikasi misi tetap lancar.</p>
                </div>
                <button type="button" className="ghost-button">
                    Kirim instruksi ke semua operative
                </button>
            </header>

            <div className="cohort-grid">
                {cohorts.map((cohort) => (
                    <article key={cohort.name} className="cohort-card">
                        <header>
                            <h2>{cohort.name}</h2>
                            <span>{cohort.members} operative</span>
                        </header>
                        <div className="progress-bar">
                            <div style={{ width: `${cohort.progress}%` }} />
                        </div>
                        <div className="cohort-meta">
                            <span>Status kesiapan</span>
                            <strong>{cohort.progress}%</strong>
                        </div>
                        <p>{cohort.highlight}</p>
                        <button type="button" className="primary-button">
                            Buka command view
                        </button>
                    </article>
                ))}
            </div>
        </div>
    );
}
