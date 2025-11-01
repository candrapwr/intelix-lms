<!DOCTYPE html>
<html lang="id">
    <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>{{ config('app.name', 'INTELIX') }} Portal Pelatihan Intelijen</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@500&display=swap" rel="stylesheet" />
        <style>
            :root {
                color-scheme: dark;
                font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                --bg-gradient: radial-gradient(circle at 15% 20%, rgba(59, 130, 246, 0.25), transparent 55%),
                    radial-gradient(circle at 85% 15%, rgba(236, 72, 153, 0.25), transparent 60%),
                    radial-gradient(circle at 40% 85%, rgba(16, 185, 129, 0.22), transparent 60%), #030712;
                --card-bg: rgba(6, 11, 25, 0.82);
                --card-border: rgba(148, 163, 184, 0.18);
                --accent: #60a5fa;
                --muted: #9ba3b0;
                --headline: #f8fafc;
            }

            * {
                box-sizing: border-box;
            }

            body {
                margin: 0;
                min-height: 100vh;
                background: var(--bg-gradient);
                color: var(--headline);
            }

            .page {
                display: flex;
                flex-direction: column;
                min-height: 100vh;
            }

            .container {
                width: min(1140px, 92vw);
                margin: 0 auto;
            }

            header {
                padding: 1.5rem 0;
            }

            .nav {
                display: flex;
                justify-content: space-between;
                align-items: center;
                gap: 1.5rem;
                flex-wrap: wrap;
            }

            .brand {
                display: flex;
                align-items: center;
                gap: 0.75rem;
                font-weight: 700;
                letter-spacing: 0.08em;
                text-transform: uppercase;
            }

            .badge {
                width: 2.75rem;
                height: 2.75rem;
                border-radius: 1rem;
                background: linear-gradient(135deg, rgba(96, 165, 250, 0.4), rgba(236, 72, 153, 0.35));
                display: grid;
                place-items: center;
                font-family: 'JetBrains Mono', monospace;
                font-size: 1.1rem;
                color: var(--headline);
            }

            .nav-links {
                display: flex;
                gap: 1.5rem;
                font-size: 0.95rem;
                color: var(--muted);
            }

            .nav-links a {
                text-decoration: none;
                color: inherit;
                transition: color 0.2s ease;
            }

            .nav-links a:hover {
                color: var(--headline);
            }

            .cta {
                display: inline-flex;
                align-items: center;
                gap: 0.5rem;
                border-radius: 999px;
                padding: 0.65rem 1.4rem;
                font-size: 0.95rem;
                background: linear-gradient(135deg, #94a3b8 0%, #1f2937 100%);
                color: #f8fafc;
                text-decoration: none;
                transition: transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
            }

            .cta:hover {
                transform: translateY(-1px);
                background: linear-gradient(135deg, #60a5fa 0%, #2563eb 100%);
                box-shadow: 0 18px 36px -24px rgba(96, 165, 250, 0.65);
            }

            main {
                flex: 1;
                padding-bottom: 6rem;
            }

            .hero {
                display: grid;
                gap: 2.5rem;
                padding: 6rem 0 4rem;
            }

            .hero-grid {
                display: grid;
                gap: 3.5rem;
                grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
                align-items: start;
            }

            .pretitle {
                display: inline-flex;
                align-items: center;
                gap: 0.5rem;
                font-size: 0.85rem;
                font-weight: 600;
                letter-spacing: 0.14em;
                color: var(--muted);
                text-transform: uppercase;
            }

            .pretitle::before {
                content: '';
                width: 2.5rem;
                height: 1px;
                background: var(--muted);
            }

            h1 {
                margin: 1.5rem 0 1rem;
                font-size: clamp(2.75rem, 4vw, 3.75rem);
                line-height: 1.1;
                font-weight: 700;
            }

            .lead {
                font-size: 1.1rem;
                line-height: 1.7;
                color: #d1d5db;
                max-width: 32rem;
            }

            .actions {
                margin-top: 2.5rem;
                display: flex;
                gap: 1rem;
                flex-wrap: wrap;
            }

            .ghost {
                border: 1px solid rgba(148, 163, 184, 0.35);
                background: transparent;
                color: var(--headline);
                padding: 0.65rem 1.4rem;
                border-radius: 999px;
                text-decoration: none;
                transition: border 0.2s ease, background 0.2s ease;
            }

            .ghost:hover {
                border-color: rgba(96, 165, 250, 0.65);
                background: rgba(96, 165, 250, 0.1);
            }

            .hero-visual {
                position: relative;
                border-radius: 1.75rem;
                overflow: hidden;
                border: 1px solid rgba(96, 165, 250, 0.2);
                background: url('https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?auto=format&fit=crop&w=1200&q=80')
                    center/cover no-repeat;
                min-height: 360px;
                display: flex;
                align-items: flex-end;
            }

            .hero-visual::after {
                content: '';
                position: absolute;
                inset: 0;
                background: linear-gradient(180deg, rgba(2, 6, 23, 0.1) 0%, rgba(2, 6, 23, 0.75) 100%);
            }

            .hero-overlay {
                position: relative;
                z-index: 1;
                width: 100%;
                padding: 2.5rem;
                display: grid;
                gap: 1.5rem;
            }

            .overlay-cards {
                display: grid;
                gap: 1rem;
                grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
            }

            .overlay-card {
                background: rgba(15, 23, 42, 0.75);
                border: 1px solid rgba(96, 165, 250, 0.25);
                border-radius: 1.2rem;
                padding: 1.1rem;
                display: grid;
                gap: 0.4rem;
            }

            .overlay-card span {
                font-size: 0.75rem;
                text-transform: uppercase;
                letter-spacing: 0.12em;
                color: rgba(148, 197, 255, 0.85);
            }

            .overlay-card strong {
                font-size: 1.4rem;
                color: #f1f5f9;
            }

            .overlay-status {
                font-family: 'JetBrains Mono', monospace;
                font-size: 0.8rem;
                color: rgba(148, 197, 255, 0.88);
            }

            section {
                margin-top: 6rem;
            }

            .section-header {
                display: flex;
                justify-content: space-between;
                align-items: flex-end;
                gap: 1.5rem;
                flex-wrap: wrap;
            }

            .section-header h2 {
                margin: 0;
                font-size: clamp(2rem, 3vw, 2.6rem);
            }

            .section-header p {
                margin: 0;
                color: #cbd5f5;
                max-width: 32rem;
                line-height: 1.6;
            }

            .grid {
                margin-top: 2.5rem;
                display: grid;
                gap: 1.6rem;
                grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
            }

            .card {
                background: var(--card-bg);
                border: 1px solid var(--card-border);
                border-radius: 1.5rem;
                padding: 1.8rem;
                display: grid;
                gap: 1rem;
                transition: transform 0.2s ease, border 0.2s ease;
            }

            .card:hover {
                transform: translateY(-4px);
                border-color: rgba(96, 165, 250, 0.45);
            }

            .card h3 {
                margin: 0;
                font-size: 1.2rem;
                color: #f8fafc;
            }

            .card p {
                margin: 0;
                color: rgba(203, 213, 225, 0.88);
                line-height: 1.6;
            }

            .role-tag {
                display: inline-flex;
                align-items: center;
                gap: 0.4rem;
                padding: 0.35rem 0.9rem;
                border-radius: 999px;
                border: 1px solid rgba(96, 165, 250, 0.3);
                font-size: 0.8rem;
                text-transform: uppercase;
                letter-spacing: 0.1em;
                color: rgba(148, 197, 255, 0.9);
            }

            .image-grid {
                margin-top: 2.5rem;
                display: grid;
                gap: 1.5rem;
                grid-template-columns: repeat(auto-fit, minmax(270px, 1fr));
            }

            .image-card {
                position: relative;
                border-radius: 1.5rem;
                overflow: hidden;
                border: 1px solid rgba(148, 163, 184, 0.18);
                min-height: 220px;
            }

            .image-card img {
                width: 100%;
                height: 100%;
                object-fit: cover;
                display: block;
            }

            .image-caption {
                position: absolute;
                inset: auto 0 0 0;
                background: linear-gradient(180deg, rgba(2, 6, 23, 0) 0%, rgba(2, 6, 23, 0.85) 100%);
                padding: 1.4rem;
                color: #e2e8f0;
            }

            .image-caption span {
                display: block;
                font-size: 0.75rem;
                text-transform: uppercase;
                letter-spacing: 0.12em;
                color: rgba(148, 197, 255, 0.85);
                margin-bottom: 0.35rem;
            }

            .timeline {
                margin-top: 2.5rem;
                display: grid;
                gap: 1.2rem;
            }

            .timeline-item {
                background: rgba(15, 23, 42, 0.6);
                border: 1px solid rgba(59, 130, 246, 0.25);
                border-radius: 1.25rem;
                padding: 1.4rem 1.6rem;
                display: grid;
                gap: 0.6rem;
            }

            .timeline-item strong {
                font-size: 1rem;
                color: #e2e8f0;
            }

            .timeline-item span {
                font-family: 'JetBrains Mono', monospace;
                font-size: 0.75rem;
                color: rgba(148, 197, 255, 0.75);
                text-transform: uppercase;
                letter-spacing: 0.08em;
            }

            footer {
                padding: 2.5rem 0 3rem;
                color: rgba(148, 163, 184, 0.75);
                font-size: 0.85rem;
                text-align: center;
            }

            @keyframes pulse {
                0% {
                    transform: scale(0.95) rotate(0deg);
                    opacity: 0.6;
                }
                50% {
                    transform: scale(1.1) rotate(2deg);
                    opacity: 0.85;
                }
                100% {
                    transform: scale(0.95) rotate(0deg);
                    opacity: 0.6;
                }
            }

            @media (max-width: 720px) {
                header {
                    padding: 1.25rem 0;
                }

                .nav {
                    justify-content: center;
                }

                .hero {
                    padding: 4.5rem 0 3rem;
                    text-align: center;
                }

                .hero-grid {
                    gap: 2.25rem;
                }

                .lead {
                    margin: 0 auto;
                }

                .actions {
                    justify-content: center;
                }

                .section-header {
                    flex-direction: column;
                    align-items: flex-start;
                }

                .section-header p {
                    max-width: 100%;
                }
            }
        </style>
    </head>
    <body>
        <div class="page">
            <header>
                <div class="container nav">
                    <div class="brand">
                        <div class="badge">IX</div>
                        <span>INTELIX Command</span>
                    </div>
                    <nav class="nav-links">
                        <a href="#misi">Misi</a>
                        <a href="#kemampuan">Kemampuan</a>
                        <a href="#peran">Peran</a>
                        <a href="#galeri">Galeri</a>
                        <a href="#intel">Intel</a>
                    </nav>
                    <a class="cta" href="{{ url('/admin/login') }}">Masuk Portal Aman</a>
                </div>
            </header>

            <main class="container">
                <section class="hero" id="misi">
                    <div class="hero-grid">
                        <div>
                            <span class="pretitle">Portal Pelatihan Resmi</span>
                            <h1>Cetak intel terbaik bersama INTELIX</h1>
                            <p class="lead">
                                Gabungkan simulasi lapangan, analitik, dan kendali komando dalam satu platform.
                                INTELIX menyelaraskan kurikulum intelijen, pengukuran kesiapan, dan koordinasi lintas detasemen agar misi strategis berjalan presisi.
                            </p>
                            <div class="actions">
                                <a class="cta" href="{{ url('/admin/login') }}">Masuk Konsol Pelatihan</a>
                                <a class="ghost" href="#kemampuan">Lihat fitur unggulan</a>
                            </div>
                        </div>
                        <div class="hero-visual">
                            <div class="hero-overlay">
                                <div class="role-tag">status intel langsung</div>
                                <div class="overlay-cards">
                                    <div class="overlay-card">
                                        <span>Operatif aktif</span>
                                        <strong>156</strong>
                                        <p>Beroperasi di 12 sel misi</p>
                                    </div>
                                    <div class="overlay-card">
                                        <span>Tingkat kesiapan</span>
                                        <strong>92%</strong>
                                        <p>Di atas target mingguan command</p>
                                    </div>
                                    <div class="overlay-card">
                                        <span>Sinyal diproses</span>
                                        <strong>4.3K</strong>
                                        <p>Siap untuk analisis manusia</p>
                                    </div>
                                </div>
                                <div class="overlay-status">
                                    &gt; link.established :: command &gt;&gt; seluruh unit sinkron di kanal bravo-tujuh
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section id="kemampuan">
                    <div class="section-header">
                        <div>
                            <h2>Kemampuan kelas misi</h2>
                            <p>
                                Dari command center hingga latihan lapangan, INTELIX menyiapkan rantai pelatihan lengkap untuk melahirkan intel yang siap diterjunkan.
                            </p>
                        </div>
                    </div>
                    <div class="grid">
                        <article class="card">
                            <div class="role-tag">Command Center</div>
                            <h3>Orkestrasi operasi realtime</h3>
                            <p>
                                Pantau KPI misi, sinkronkan detasemen, dan kirim arahan strategis dengan data lapangan terkini.
                            </p>
                        </article>
                        <article class="card">
                            <div class="role-tag">Field Training</div>
                            <h3>Simulasi taktis adaptif</h3>
                            <p>
                                Rilis modul SIGINT, HUMINT, dan counter-surveillance dengan evaluasi otomatis per sel latihan.
                            </p>
                        </article>
                        <article class="card">
                            <div class="role-tag">Analytics</div>
                            <h3>Intel analitik prediktif</h3>
                            <p>
                                Deteksi gap kesiapan, pola ancaman, dan rekomendasi tindakan cepat berbasis insight visual.
                            </p>
                        </article>
                        <article class="card">
                            <div class="role-tag">Security</div>
                            <h3>Keamanan berlapis</h3>
                            <p>
                                Siap integrasi autentikasi tingkat tinggi, logging terpusat, dan audit trail atas seluruh aktivitas latihan.
                            </p>
                        </article>
                    </div>
                </section>

                <section id="peran">
                    <div class="section-header">
                        <div>
                            <h2>Peran terintegrasi</h2>
                            <p>
                                Pengalaman yang disesuaikan untuk command lead, field coach, dan trainee memastikan seluruh rantai intel berjalan sinkron.
                            </p>
                        </div>
                        <a class="ghost" href="{{ url('/admin/login') }}">Masuk ke portal</a>
                    </div>
                    <div class="grid">
                        <article class="card">
                            <h3>Command Lead</h3>
                            <p>
                                Kendalikan operasi aktif, awasi readiness score, dan akses feed intel instan untuk keputusan strategis.
                            </p>
                        </article>
                        <article class="card">
                            <h3>Field Coach</h3>
                            <p>
                                Rancang kurikulum operasi, review dossier taktis, dan distribusikan instruksi ke setiap sel.
                            </p>
                        </article>
                        <article class="card">
                            <h3>Operative Trainee</h3>
                            <p>
                                Ikuti modul yang terpersonalisasi, catat progres harian, dan siapkan diri menghadapi simulasi lapangan.
                            </p>
                        </article>
                    </div>
                </section>

                <section id="galeri">
                    <div class="section-header">
                        <div>
                            <h2>Galeri operasi</h2>
                            <p>
                                Potret latihan intelijen digital: pengumpulan data, koordinasi tim, dan simulasi command room terpusat.
                            </p>
                        </div>
                    </div>
                    <div class="image-grid">
                        <div class="image-card">
                            <img src="https://images.unsplash.com/photo-1451187858446-ccc44e122ba8?auto=format&fit=crop&w=1000&q=80" alt="Pusat komando intelijen dengan layar data" />
                            <div class="image-caption">
                                <span>Command Room</span>
                                Monitor taktis terintegrasi untuk pantau operasi lintas divisi.
                            </div>
                        </div>
                        <div class="image-card">
                            <img src="https://images.unsplash.com/photo-1525182008055-f88b95ff7980?auto=format&fit=crop&w=1000&q=80" alt="Analis intelijen sedang mengolah data" />
                            <div class="image-caption">
                                <span>Intel Analysis</span>
                                Analis memverifikasi sinyal dan mengonversinya menjadi aksi lapangan.
                            </div>
                        </div>
                        <div class="image-card">
                            <img src="https://images.unsplash.com/photo-1553877522-43269d4ea984?auto=format&fit=crop&w=1000&q=80" alt="Tim lapangan melakukan koordinasi digital" />
                            <div class="image-caption">
                                <span>Field Simulation</span>
                                Sel lapangan menjalankan skenario penyamaran dengan dukungan data realtime.
                            </div>
                        </div>
                    </div>
                </section>

                <section id="intel">
                    <div class="section-header">
                        <div>
                            <h2>Intel feed harian</h2>
                            <p>
                                Rangkuman aktivitas terbaru memastikan setiap agen berada pada frekuensi yang sama sebelum operasi dimulai.
                            </p>
                        </div>
                    </div>
                    <div class="timeline">
                        <div class="timeline-item">
                            <span>07:15 zulu</span>
                            <strong>Simulasi infiltrasi malam Shadow Unit Alpha mencatat keberhasilan 94 persen.</strong>
                            <p>Catatan command: lakukan evaluasi eksfiltrasi tambahan sebelum briefing sore.</p>
                        </div>
                        <div class="timeline-item">
                            <span>09:40 zulu</span>
                            <strong>Dossier Aurora Route disetujui untuk operasi lapangan.</strong>
                            <p>Analis intel menandai dua anomali sinyal yang membutuhkan konfirmasi lapangan.</p>
                        </div>
                        <div class="timeline-item">
                            <span>11:05 zulu</span>
                            <strong>Sesi debrief lintas sel dijadwalkan ulang ke pukul 19:00.</strong>
                            <p>Field coach akan memimpin ulasan strategi komunikasi covert tambahan.</p>
                        </div>
                    </div>
                </section>
            </main>

            <footer>
                INTELIX Portal Pelatihan Intelijen &middot; Percepat kesiapan. Amankan misi bangsa.
            </footer>
        </div>
    </body>
</html>
