import './student.css';

const highlights = [
    {
        title: 'Active Missions',
        value: '4',
        description: 'Pertahankan momentum latihan. Selesaikan satu modul operasi hari ini.',
    },
    {
        title: 'Readiness Score',
        value: '86%',
        description: 'Di atas target command center untuk minggu berjalan. Tetapkan disiplin.',
    },
    {
        title: 'Next Briefing',
        value: 'Thu - 13:00',
        description: 'Joint intel sync dengan Field Coach Helena di ruang situasi.',
    },
];

export default function StudentHomePage() {
    return (
        <div className="student-page">
            <section className="hero-banner">
                <div>
                    <h1>Operative, welcome back 👋</h1>
                    <p>INTELIX merangkum setiap misi, latihan, dan KPI agar kesiapan Anda selalu dalam radar.</p>
                </div>
                <div className="hero-progress">
                    <span className="progress-label">Readiness streak</span>
                    <span className="progress-value">12 days 🔥</span>
                </div>
            </section>

            <section className="highlight-grid">
                {highlights.map((item) => (
                    <article key={item.title} className="highlight-card">
                        <h2>{item.title}</h2>
                        <div className="card-value">{item.value}</div>
                        <p>{item.description}</p>
                    </article>
                ))}
            </section>

            <section className="timeline-card">
                <header>
                    <h2>Rencana operasi hari ini</h2>
                    <span>3 aktivitas intel</span>
                </header>
                <ul>
                    <li>
                        <span className="badge primary">Module</span>
                        <div>
                            <strong>Counter-Surveillance Basics</strong>
                            <p>Tinjau rekaman lapangan dan selesaikan evaluasi deteksi musuh.</p>
                        </div>
                        <time>09:00</time>
                    </li>
                    <li>
                        <span className="badge accent">Dossier</span>
                        <div>
                            <strong>Operational Dossier</strong>
                            <p>Susun ringkasan target dan jalur infiltrasi untuk operasi Aurora.</p>
                        </div>
                        <time>13:00</time>
                    </li>
                    <li>
                        <span className="badge soft">Debrief</span>
                        <div>
                            <strong>Cell Debrief Circle</strong>
                            <p>Bagikan temuan intel bersama sel kolega untuk mendapatkan badge taktis.</p>
                        </div>
                        <time>19:30</time>
                    </li>
                </ul>
            </section>
        </div>
    );
}
