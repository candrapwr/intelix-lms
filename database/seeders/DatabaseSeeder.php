<?php

namespace Database\Seeders;

use App\Models\CourseClassification;
use App\Models\SubUnit;
use App\Models\Unit;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

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
            ['name' => 'Operasi Dasar', 'slug' => 'operasi-dasar', 'description' => 'Kurikulum fundamental untuk operatif baru.', 'sort_order' => 1],
            ['name' => 'Operasi Lanjutan', 'slug' => 'operasi-lanjutan', 'description' => 'Pendalaman taktik intelijen tingkat menengah.', 'sort_order' => 2],
            ['name' => 'Spesialis Strategis', 'slug' => 'spesialis-strategis', 'description' => 'Program elite untuk operasi berisiko tinggi.', 'sort_order' => 3],
        ])->map(fn ($payload) => CourseClassification::create($payload));

        $units = collect([
            [
                'name' => 'Unit Pelatihan Dasar',
                'code' => 'UPD',
                'description' => 'Kelompok pelatihan level dasar untuk peserta baru.',
            ],
            [
                'name' => 'Unit Pengembangan Profesional',
                'code' => 'UPP',
                'description' => 'Program pengembangan kompetensi lanjutan.',
            ],
            [
                'name' => 'Unit Sertifikasi',
                'code' => 'USF',
                'description' => 'Fokus pada persiapan sertifikasi resmi.',
            ],
        ])->map(function (array $data) {
            $subUnits = match ($data['code']) {
                'UPD' => [
                    ['name' => 'Kelas Orientasi', 'code' => 'UPD-OR', 'description' => 'Pengenalan lembaga dan aturan belajar.'],
                    ['name' => 'Kelas Dasar A', 'code' => 'UPD-A', 'description' => 'Pelatihan dasar gelombang A.'],
                ],
                'UPP' => [
                    ['name' => 'Leadership Track', 'code' => 'UPP-LD', 'description' => 'Penguatan kepemimpinan dan komunikasi.'],
                    ['name' => 'Teknis Lanjutan', 'code' => 'UPP-TL', 'description' => 'Workshop keterampilan teknis spesifik.'],
                ],
                default => [
                    ['name' => 'Persiapan Uji Kompetensi', 'code' => 'USF-PK', 'description' => 'Pendampingan jelang sertifikasi.'],
                    ['name' => 'Kelas Simulasi', 'code' => 'USF-SM', 'description' => 'Simulasi ujian dan umpan balik instruktur.'],
                ],
            };

            $unit = Unit::create($data);
            collect($subUnits)->each(fn ($payload) => $unit->subUnits()->create($payload));

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
    }
}
