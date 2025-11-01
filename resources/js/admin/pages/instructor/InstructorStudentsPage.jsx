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
            <section className="under-development-section">
                <h2>Students - Under Development</h2>
                <p>This students management page is currently under development and will be available soon.</p>
            </section>
        </div>
    );
}
