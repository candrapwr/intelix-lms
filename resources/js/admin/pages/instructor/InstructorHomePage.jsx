import './instructor.css';

const quickStats = [
    { label: 'Active missions', value: '5', detail: '3 live / 2 in prep' },
    { label: 'Intel satisfaction', value: '4.8', detail: '128 tactical reviews' },
    { label: 'Operatives coached', value: '156', detail: '12 fresh recruits' },
];

export default function InstructorHomePage() {
    return (
        <div className="instructor-page">
            <section className="instructor-hero">
                <div>
                    <h1>Command ready?</h1>
                    <p>
                        Pantau misi, rilis modul operasi, dan arahkan operative Anda dari dek komando terpadu
                        INTELIX.
                    </p>
                </div>
                <div className="hero-actions">
                    <button type="button" className="primary-button">
                        Jadwalkan sesi taktis
                    </button>
                    <button type="button" className="ghost-button">
                        Rekam briefing intel
                    </button>
                </div>
            </section>

            <section className="stat-grid">
                {quickStats.map((item) => (
                    <article key={item.label}>
                        <span>{item.label}</span>
                        <strong>{item.value}</strong>
                        <p>{item.detail}</p>
                    </article>
                ))}
            </section>

            <section className="activity-feed">
                <header>
                    <h2>Intel activity feed</h2>
                    <button type="button" className="ghost-button">
                        View all
                    </button>
                </header>
                <ul>
                    <li>
                        <div className="feed-icon accent">M</div>
                        <div>
                        <strong>Module operasi dirilis</strong>
                        <p>Simulasi infiltrasi malam siap untuk sel Alpha-23.</p>
                        </div>
                        <time>Just now</time>
                    </li>
                    <li>
                        <div className="feed-icon positive">A</div>
                        <div>
                        <strong>Dossier taktis diterima</strong>
                        <p>7 operative menyerahkan laporan &quot;Aurora Route&quot; sebelum tenggat.</p>
                        </div>
                        <time>45 minutes ago</time>
                    </li>
                    <li>
                        <div className="feed-icon soft">S</div>
                        <div>
                        <strong>Debrief terjadwal</strong>
                        <p>Workshop taktik urban dijadwalkan Kamis pukul 14:00.</p>
                        </div>
                        <time>Today, 09:20</time>
                    </li>
                </ul>
            </section>
        </div>
    );
}
