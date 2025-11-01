<?php

namespace Database\Seeders;

use App\Models\Course;
use App\Models\CourseClassification;
use App\Models\SubUnit;
use App\Models\Unit;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $adminEmail = config('app.admin_email', 'admin@example.com');

        $classifications = collect([
            ['name' => 'Surveilans', 'slug' => 'surveilans', 'description' => 'Teknik observasi lapangan dan pengawasan target.', 'sort_order' => 1],
            ['name' => 'Kontra Surveilans', 'slug' => 'kontra-surveilans', 'description' => 'Strategi mengidentifikasi dan menetralisir pengawasan musuh.', 'sort_order' => 2],
            ['name' => 'Nubika', 'slug' => 'nubika', 'description' => 'Penanganan ancaman nuklir, biologi, dan kimia.', 'sort_order' => 3],
            ['name' => 'Digital Forensik', 'slug' => 'digital-forensik', 'description' => 'Analisis jejak digital dan investigasi forensik.', 'sort_order' => 4],
        ])->map(fn ($payload) => CourseClassification::create($payload));

        $units = collect([
            [
                'attributes' => [
                    'name' => 'Deputi II',
                    'code' => 'DEP-II',
                    'description' => 'Koordinasi intelijen teritorial dan operasi daerah.',
                ],
                'sub_units' => [
                    ['name' => 'Binda Aceh', 'code' => 'DEP2-ACEH', 'description' => 'Badan Intelijen Daerah Aceh.'],
                    ['name' => 'Binda Jakarta', 'code' => 'DEP2-JKT', 'description' => 'Badan Intelijen Daerah Jakarta.'],
                    ['name' => 'Binda Yogyakarta', 'code' => 'DEP2-JOG', 'description' => 'Badan Intelijen Daerah Istimewa Yogyakarta.'],
                ],
            ],
            [
                'attributes' => [
                    'name' => 'Deputi III',
                    'code' => 'DEP-III',
                    'description' => 'Direktorat kontra intelijen dan penanggulangan ancaman.',
                ],
                'sub_units' => [
                    ['name' => 'Direktorat Kontra Separatisme & Konflik', 'code' => 'DEP3-KSK', 'description' => 'Pengendalian ancaman separatis dan konflik.'],
                    ['name' => 'Direktorat Operasi Kontra Intelijen', 'code' => 'DEP3-OKI', 'description' => 'Operasi kontra intelijen strategis.'],
                    ['name' => 'Direktorat Pengamanan Intelijen', 'code' => 'DEP3-PI', 'description' => 'Pengamanan aset dan jaringan intelijen.'],
                ],
            ],
        ])->map(function (array $payload) {
            $unit = Unit::create($payload['attributes']);
            collect($payload['sub_units'] ?? [])->each(fn ($subUnit) => $unit->subUnits()->create($subUnit));

            return $unit;
        });

        User::factory()
            ->admin()
            ->create([
                'name' => 'Super Admin',
                'email' => $adminEmail,
            ]);

        $allSubUnits = SubUnit::all();

        User::factory(5)
            ->student()
            ->state(function () use ($allSubUnits) {
                $subUnit = $allSubUnits->random();

                return [
                    'unit_id' => $subUnit->unit_id,
                    'sub_unit_id' => $subUnit->id,
                ];
            })
            ->create();

        User::factory(3)
            ->instructor()
            ->state(function () use ($units) {
                $unit = $units->random();

                return [
                    'unit_id' => $unit->id,
                ];
            })
            ->create();

        if ($allSubUnits->isNotEmpty()) {
            $sampleSubUnit = $allSubUnits->first();

            User::factory()
                ->student()
                ->create([
                    'name' => 'Sample Trainee',
                    'email' => 'student@intelix.local',
                    'unit_id' => $sampleSubUnit->unit_id,
                    'sub_unit_id' => $sampleSubUnit->id,
                    'password' => 'password',
                ]);
        }

        $classificationMap = CourseClassification::whereIn('slug', [
            'kontra-surveilans',
            'surveilans',
            'digital-forensik',
        ])->get()->keyBy('slug');

        $instructors = User::query()->where('role', 'instructor')->inRandomOrder()->take(3)->get();

        if ($instructors->isNotEmpty()) {
            $courses = [
                [
                    'classification_slug' => 'kontra-surveilans',
                    'title' => 'Operasi Kontra Intelijen',
                    'short_description' => 'Strategi mendeteksi, menganalisis, dan menetralkan operasi intelijen lawan.',
                    'description' => <<<HTML
<p>Kursus ini membahas fondasi kontra intelijen, penyusunan operasi kontra, serta studi kasus penanggulangan infiltrasi intelijen asing.</p>
<ul>
    <li>Pemetaan ancaman dan celah keamanan intelijen.</li>
    <li>Teknik kontra surveilans lapangan dan digital.</li>
    <li>Simulasi desk-top penanganan krisis intelijen.</li>
</ul>
HTML,
                    'duration_minutes' => 420,
                    'sections' => [
                        [
                            'title' => 'Analisis Ancaman & Perencanaan Operasi',
                            'summary' => 'Menganalisis pola operasi lawan dan merancang skenario kontra intelijen.',
                            'materials' => [
                                ['title' => 'Template Rencana Kontra Intelijen', 'file_path' => 'course-materials/kontra-intelijen/template-rencana.pdf', 'file_name' => 'template-rencana-kontra-intelijen.pdf', 'mime_type' => 'application/pdf', 'file_size' => 1_200_000],
                                ['title' => 'Briefing Video Counter Intelligence', 'file_path' => 'course-materials/kontra-intelijen/briefing-video.mp4', 'file_name' => 'briefing-counter-intel.mp4', 'mime_type' => 'video/mp4', 'file_size' => 48_500_000],
                            ],
                        ],
                        [
                            'title' => 'Pelaksanaan Lapangan & Evaluasi',
                            'summary' => 'Implementasi kontra surveilans serta proses evaluasi pasca operasi.',
                            'materials' => [
                                ['title' => 'Checklist Operasi Lapangan', 'file_path' => 'course-materials/kontra-intelijen/checklist-operasi.xlsx', 'file_name' => 'checklist-operasi-kontra-intelijen.xlsx', 'mime_type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'file_size' => 320_000],
                            ],
                        ],
                    ],
                ],
                [
                    'classification_slug' => 'surveilans',
                    'title' => 'Surveilans Lapangan Taktis',
                    'short_description' => 'Metodologi observasi lapangan dan pemantauan target secara terselubung.',
                    'description' => <<<HTML
<p>Fokus pada teknik surveilans tingkat lanjut, penggunaan perangkat optik, serta manuver tim untuk menjaga kerahasiaan operasi.</p>
<ul>
    <li>Perencanaan jalur surveilans dan penentuan titik pengamatan.</li>
    <li>Disiplin komunikasi dan pengelolaan bukti visual.</li>
    <li>Studi kasus operasi lapangan multi-lokasi.</li>
</ul>
HTML,
                    'duration_minutes' => 360,
                    'sections' => [
                        [
                            'title' => 'Fondasi Pengintaian',
                            'summary' => 'Dasar teori, etika, dan pemilihan alat surveilans.',
                            'materials' => [
                                ['title' => 'Modul Taktik Observasi', 'file_path' => 'course-materials/surveilans/modul-taktik.pdf', 'file_name' => 'modul-taktik-observasi.pdf', 'mime_type' => 'application/pdf', 'file_size' => 980_000],
                            ],
                        ],
                        [
                            'title' => 'Simulasi Lapangan',
                            'summary' => 'Penerapan teknik surveilans dalam skenario urban.',
                            'materials' => [
                                ['title' => 'Checklist Simulasi Kota', 'file_path' => 'course-materials/surveilans/checklist-simulasi.xlsx', 'file_name' => 'checklist-simulasi-kota.xlsx', 'mime_type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'file_size' => 270_000],
                                ['title' => 'Video Demo Sinyal', 'file_path' => 'course-materials/surveilans/video-demo.mp4', 'file_name' => 'video-demo-sinyal.mp4', 'mime_type' => 'video/mp4', 'file_size' => 32_000_000],
                            ],
                        ],
                    ],
                ],
                [
                    'classification_slug' => 'digital-forensik',
                    'title' => 'Forensik Digital & Jejak Siber',
                    'short_description' => 'Mengungkap bukti digital dan melacak aktivitas siber lawan.',
                    'description' => <<<HTML
<p>Menyajikan teknik akuisisi data, analisis artefak digital, serta prosedur pelaporan forensik untuk penegakan hukum.</p>
<ul>
    <li>Prosedur imaging perangkat dan menjaga rantai bukti.</li>
    <li>Analisis log, metadata, dan artefak aplikasi.</li>
    <li>Pelaporan forensik yang dapat diterima di pengadilan.</li>
</ul>
HTML,
                    'duration_minutes' => 540,
                    'sections' => [
                        [
                            'title' => 'Akuisisi & Preservasi Data',
                            'summary' => 'Teknik menyalin dan mengamankan bukti digital.',
                            'materials' => [
                                ['title' => 'Panduan Imaging', 'file_path' => 'course-materials/digital-forensik/panduan-imaging.pdf', 'file_name' => 'panduan-imaging.pdf', 'mime_type' => 'application/pdf', 'file_size' => 1_540_000],
                            ],
                        ],
                        [
                            'title' => 'Analisis Artefak & Pelaporan',
                            'summary' => 'Mengkaji artefak sistem dan menyusun laporan akhir.',
                            'materials' => [
                                ['title' => 'Template Laporan Forensik', 'file_path' => 'course-materials/digital-forensik/template-laporan.docx', 'file_name' => 'template-laporan-forensik.docx', 'mime_type' => 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'file_size' => 220_000],
                                ['title' => 'Demo Analisis Log', 'file_path' => 'course-materials/digital-forensik/demo-analisis.mp4', 'file_name' => 'demo-analisis-log.mp4', 'mime_type' => 'video/mp4', 'file_size' => 26_000_000],
                            ],
                        ],
                    ],
                ],
            ];

            foreach ($courses as $index => $payload) {
                $classification = $classificationMap->get($payload['classification_slug']);
                $instructor = $instructors[$index % $instructors->count()] ?? $instructors->first();

                if (! $classification || ! $instructor) {
                    continue;
                }

                $course = Course::create([
                    'classification_id' => $classification->id,
                    'instructor_id' => $instructor->id,
                    'slug' => Str::slug($payload['title']),
                    'title' => $payload['title'],
                    'short_description' => $payload['short_description'],
                    'description' => $payload['description'],
                    'status' => 'published',
                    'duration_minutes' => $payload['duration_minutes'],
                    'lesson_count' => 6,
                    'price' => 0,
                    'published_at' => now()->subDays(rand(1, 5)),
                ]);

                foreach ($payload['sections'] as $order => $sectionData) {
                    $section = $course->sections()->create([
                        'title' => $sectionData['title'],
                        'summary' => $sectionData['summary'],
                        'sort_order' => $order + 1,
                    ]);

                    foreach ($sectionData['materials'] as $materialOrder => $material) {
                        $section->materials()->create([
                            'title' => $material['title'],
                            'description' => $material['description'] ?? null,
                            'file_path' => $material['file_path'],
                            'file_name' => $material['file_name'],
                            'mime_type' => $material['mime_type'],
                            'file_size' => $material['file_size'],
                            'storage_disk' => 'public',
                            'sort_order' => $materialOrder + 1,
                        ]);
                    }
                }
            }
        }
    }
}
