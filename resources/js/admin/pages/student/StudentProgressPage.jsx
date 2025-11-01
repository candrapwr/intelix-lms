import './student.css';

const milestones = [
    {
        title: 'SIGINT Tradecraft Advanced',
        status: 'Completed',
        completion: 'Completed - Mar 2, 2024',
        score: 'Intel rating 94%',
    },
    {
        title: 'Urban Shadow Run Simulation',
        status: 'In review',
        completion: 'Awaiting tactical audit',
        score: 'Pending',
    },
    {
        title: 'Threat Modeling Workshop',
        status: 'In progress',
        completion: 'Due in 3 days',
        score: 'Pending',
    },
];

export default function StudentProgressPage() {
    return (
        <div className="student-page">
            <header className="section-header">
                <div>
                    <h1>Readiness overview</h1>
                    <p>Pantau capaian latihan intel dan fokuskan energi pada taktik yang perlu diperkuat.</p>
                </div>
                <button type="button" className="secondary-button">
                    Unduh laporan intel
                </button>
            </header>

            <div className="progress-summary">
                <div className="summary-card">
                    <span>Mission completion</span>
                    <strong>78%</strong>
                    <p>Dari 6 misi latihan aktif</p>
                </div>
                <div className="summary-card">
                    <span>Clearance badges</span>
                    <strong>12</strong>
                    <p>Terbaru: Collaboration Catalyst</p>
                </div>
                <div className="summary-card">
                    <span>Simulation hours</span>
                    <strong>18h</strong>
                    <p>2 jam tercatat pekan ini</p>
                </div>
            </div>

            <div className="milestone-list">
                <header>
                    <h2>Milestones</h2>
                    <span>Jaga disiplin. Latihan detail memastikan keberhasilan misi.</span>
                </header>
                <ul>
                    {milestones.map((item) => (
                        <li key={item.title}>
                            <div className="milestone-title">
                                <strong>{item.title}</strong>
                                <span className={`status status-${item.status.replace(' ', '').toLowerCase()}`}>
                                    {item.status}
                                </span>
                            </div>
                            <div className="milestone-meta">
                                <span>{item.completion}</span>
                                <span>{item.score}</span>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}
