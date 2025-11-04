# INTELIX LMS (Laravel 12 + PostgreSQL + React Admin)

INTELIX adalah platform pembelajaran intelijen terpadu yang menyatukan API backend Laravel, Postgres sebagai basis data utama, dan SPA admin berbasis React (Vite). Sistem ini dirancang sebagai pusat resmi pelatihan intelijen digital untuk agen aktif, calon agen, serta analis agar mampu mengasah keterampilan operasional, analitik, dan koordinasi misi secara terukur.

---

## 0. Fitur Unggulan
- Skema data lengkap untuk Course, Section, Module, Lesson, Enrollment, Assignment, Submission, dan Category guna menampung materi operasi intelijen, simulasi lapangan, dan analisis strategis.
- Role management (`admin` sebagai command center, `instructor` sebagai field coach, `student` sebagai trainee) dengan dukungan soft delete dan profil JSON untuk rekam kompetensi.
- API REST `/api/admin` menghadirkan kendali penuh atas dashboard, kursus, dan personel pelatihan intelijen, siap diproteksi autentikasi tingkat tinggi.
- Admin SPA modern: sidebar responsif, search bar, tema glassmorphism, dan navigasi profesional layaknya mission control deck.
- Portal login modern memakai kredensial asli (email + password) dan otomatis mengarahkan pengguna ke dashboard sesuai rolenya (`admin`, `instructor`, `student`).
- CRUD interaktif dengan modal, validasi dasar, filter pencarian, pagination, serta toast notifikasi real-time untuk memastikan update misi instan.
- Master data Unit & Sub Unit untuk mengelompokkan detasemen, task force, dan tim analisis lintas divisi.
- Master data Klasifikasi Kursus untuk mengelompokkan jalur pelatihan (dasar, lanjutan, spesialis) secara terstruktur.
- Section builder per kursus dengan materi terlampir (PDF, video, dokumen) yang tersimpan terurut dan siap diunduh peserta.
- Manajemen kuis pilihan ganda per section dengan dukungan pembuatan oleh admin/instruktur, penilaian otomatis, serta rekam jawaban siswa untuk evaluasi lanjutan.
- Penetapan status training gratis secara default sembari membuka peluang integrasi skema insentif atau clearance level ke depan.
- Seeder contoh menyiapkan administrator, pelatih intelijen, serta trainee dummy untuk kickstart demo taktis.

## 1. Tumpukan Teknologi
- **Backend**: Laravel 12, PHP 8.2, Eloquent ORM, FormRequest, API Resources.
- **Database**: PostgreSQL (menggunakan fitur `ilike`, enum, relations).
- **Frontend Admin**: React 18, React Router, Vite dev server, CSS modular per komponen.
- **Tooling**: Composer, npm, artisan, PHPUnit (testing), Vite bundler.

## 2. Persyaratan Lokal
- PHP >= 8.2 dengan ekstensi: `pgsql`, `pdo_pgsql`, `mbstring`, `openssl`, `gd`, `intl`.
- Composer >= 2.5.
- Node.js >= 20 & npm.
- PostgreSQL >= 14.
- (Opsional) Redis untuk queue/cache jika ingin dikembangkan nanti.

## 3. Konfigurasi Lingkungan
1. Duplikasi dan sesuaikan environment:
   ```bash
   cp .env.example .env
   php artisan key:generate
   ```
2. Set variabel penting di `.env`:
   ```env
   APP_NAME="INTELIX"
   APP_URL=http://localhost:8000
   APP_ADMIN_EMAIL=command@intelix.local

   DB_CONNECTION=pgsql
   DB_HOST=127.0.0.1
   DB_PORT=5432
   DB_DATABASE=intelix_lms
   DB_USERNAME=intelix_admin
   DB_PASSWORD=change_me_now

   SESSION_DRIVER=database
   CACHE_STORE=database
   QUEUE_CONNECTION=database
   ```
3. Pastikan database Postgres sesuai atau buat baru:
   ```bash
   createdb intelix_lms
   createuser --pwprompt intelix_admin
   ```

## 4. Instalasi Dependensi
```bash
composer install
npm install
```

## 5. Migrasi & Seeder
```bash
php artisan migrate --seed
```
Seeder akan membuat:
- 1 akun admin (email dari `APP_ADMIN_EMAIL`, password default `password`).
- 3 instruktur dummy dengan profil expertise.
- 5 siswa dummy acak.
- 1 siswa demo (`student@intelix.local`, password `password`).
- 1 kursus demo **Operasi Kontra Intelijen** beserta section dan materi contoh untuk pengujian frontend.

## 6. Menjalankan Aplikasi
### Backend API
```bash
php artisan serve --host=0.0.0.0 --port=8000
```

### Vite Dev Server (SPA Admin)
```bash
npm run dev
```
Laravel Vite plugin otomatis mem-proxy hasil compile ke `http://localhost:8000`. Akses panel admin di `http://localhost:8000/admin`.
Halaman login tersedia di `http://localhost:8000/admin/login` dan akan meneruskan pengguna ke dashboard sesuai peran yang dipilih.

### Build Produksi
```bash
npm run build
php artisan optimize
```
Output dibundle ke `public/build`. Jalankan kembali `php artisan view:clear` bila ada perubahan blade.

## 7. Struktur Direktori
```
app/
  Http/
    Controllers/
      Admin/
        CourseController.php
        CourseMaterialController.php
        CourseSectionController.php
        CourseQuizController.php
        DashboardController.php
        InstructorController.php
        StudentController.php
      Instructor/
        InstructorCourseController.php
        InstructorCourseSectionController.php
        InstructorCourseMaterialController.php
        InstructorCourseQuizController.php
      Student/
        StudentCourseController.php
        StudentQuizController.php
      AuthController.php
    Requests/
      Admin/
        StoreCourseRequest.php
        UpdateCourseRequest.php
        StoreCourseSectionRequest.php
        UpdateCourseSectionRequest.php
        StoreCourseMaterialRequest.php
        UpdateCourseMaterialRequest.php
        StoreStudentRequest.php
        UpdateStudentRequest.php
        StoreInstructorRequest.php
        UpdateInstructorRequest.php
        StoreCourseQuizRequest.php
        UpdateCourseQuizRequest.php
      Student/
        SubmitSectionQuizRequest.php
    Resources/
      CourseResource.php
      CourseQuizResource.php
      CourseQuizOptionResource.php
      CourseQuizAttemptResource.php
      CourseQuizAttemptAnswerResource.php
      UserResource.php
      Student/
        StudentCourseDetailResource.php
        StudentCourseResource.php
  Models/
    Assignment.php
    Category.php
    Course.php
    CourseMaterial.php
    CourseSection.php
    CourseQuiz.php
    CourseQuizOption.php
    CourseQuizAttempt.php
    CourseQuizAttemptAnswer.php
    Enrollment.php
    Lesson.php
    Module.php
    Submission.php

bootstrap/app.php            # Registrasi file routes/api.php

config/app.php               # Konfigurasi tambahan (APP_ADMIN_EMAIL)

database/
  factories/
    UserFactory.php          # State admin/instructor/student
  migrations/                # Skema Postgres untuk domain LMS
  seeders/
    DatabaseSeeder.php       # Seeder admin + data dummy

resources/
  js/admin/
    api/client.js            # Axios instance /api/admin
    api/studentClient.js     # Axios instance /api/student (token-based)
    components/
      Layout.jsx
      StudentLayout.jsx
      InstructorLayout.jsx
      ProtectedRoute.jsx
      Modal.jsx
      layout.css
    context/
      NotificationContext.jsx
      AuthContext.jsx
    hooks/
      useDebounce.js
    pages/
      DashboardPage.jsx
      CourseListPage.jsx
      CourseSectionsPage.jsx
      CourseClassificationPage.jsx
      StudentListPage.jsx
      InstructorListPage.jsx
      UnitListPage.jsx
      SubUnitListPage.jsx
      NotFoundPage.jsx
      auth/
        LoginPage.jsx
      student/
        StudentHomePage.jsx
        StudentCoursesPage.jsx
        StudentProgressPage.jsx
      instructor/
        InstructorHomePage.jsx
        InstructorCoursesPage.jsx
        InstructorStudentsPage.jsx
    App.jsx
    main.jsx
  views/
    admin.blade.php          # Shell SPA admin + @viteReactRefresh

routes/
  api.php                    # Semua route /api/admin
  web.php                    # Route welcome & fallback SPA admin

public/build/                # Output produksi Vite
vite.config.js               # Konfigurasi Vite (Laravel, Tailwind, React)
package.json
```

## 8. Arsitektur API
- Prefix route admin: `/api/admin` (lihat `routes/api.php`).
- Prefix route student: `/api/student` dengan middleware token ringan (`auth.token`).
- Endpoint autentikasi tersedia di `/api/auth/*` (login, logout, me).
- Filtering & pagination lewat query string (`status`, `category_id`, `level`, `search`).

### Admin
| Method | Endpoint | Controller | Catatan |
| --- | --- | --- | --- |
| GET | `/api/admin/dashboard/metrics` | `DashboardController@metrics` | Ringkasan total siswa, instruktur, kursus, completion rate |
| GET | `/api/admin/courses` | `CourseController@index` | Support filter status/category/level/search |
| POST | `/api/admin/courses` | `CourseController@store` | Auto-assign slug dari judul bila kosong |
| GET | `/api/admin/courses/{slug}` | `CourseController@show` | Memuat modules, lessons, students |
| PATCH | `/api/admin/courses/{slug}` | `CourseController@update` | Partial update |
| DELETE | `/api/admin/courses/{slug}` | `CourseController@destroy` | Soft delete di masa depan bisa diaktifkan |
| GET/POST | `/api/admin/sections/{section}/quizzes` | `CourseQuizController@index/store` | Kelola kuis per section, termasuk urutan dan penjelasan |
| PATCH/DELETE | `/api/admin/quizzes/{quiz}` | `CourseQuizController@update/destroy` | Pembaruan konten kuis atau penghapusan permanen |
| GET/POST | `/api/admin/students` | `StudentController` | Password otomatis di-hash; role lock ke `student` |
| GET/PATCH/DELETE | `/api/admin/students/{id}` | `StudentController` | Validasi email unik + optional password |
| GET/POST | `/api/admin/instructors` | `InstructorController` | Memuat daftar kursus ajar |
| GET/PATCH/DELETE | `/api/admin/instructors/{id}` | `InstructorController` | Update profil expertise/bio |
| GET/POST | `/api/admin/units` | `UnitController` | Master unit pelatihan, lengkap dengan jumlah sub unit |
| GET/PATCH/DELETE | `/api/admin/units/{id}` | `UnitController` | Detail, update, dan hapus unit (menghapus sub unit turunannya) |
| GET/POST | `/api/admin/sub-units` | `SubUnitController` | Master sub unit per unit |
| GET/PATCH/DELETE | `/api/admin/sub-units/{id}` | `SubUnitController` | Detail, update, dan hapus sub unit |

Respons standar menggunakan `CourseResource` & `UserResource` untuk menjaga kontrak JSON.

### Autentikasi
| Method | Endpoint | Controller | Catatan |
| --- | --- | --- | --- |
| POST | `/api/auth/login` | `AuthController@login` | Verifikasi email + password, menghasilkan token `Bearer` |
| POST | `/api/auth/logout` | `AuthController@logout` | Membatalkan token aktif (wajib header Authorization) |
| GET | `/api/auth/me` | `AuthController@me` | Mengembalikan profil singkat dari token aktif |

### Student
| Method | Endpoint | Controller | Catatan |
| --- | --- | --- | --- |
| GET | `/api/student/courses` | `StudentCourseController@index` | Daftar kursus publik beserta status enrolment pengguna |
| POST | `/api/student/courses/{slug}/enroll` | `StudentCourseController@enroll` | Enroll kursus (idempotent; tolak jika sudah terdaftar) |
| GET | `/api/student/my-courses` | `StudentCourseController@myCourses` | Kursus yang diikuti lengkap dengan progres singkat |
| GET | `/api/student/my-courses/{slug}` | `StudentCourseController@showMyCourse` | Detail kursus + section & materi; update `last_accessed_at` |
| POST | `/api/student/sections/{section}/quizzes/submit` | `StudentQuizController@submit` | Simpan jawaban kuis section, nilai otomatis, dan kunci hasil |

## 9. SPA Admin & Portal Pengguna
- Entry React: `resources/js/admin/main.jsx` dengan `BrowserRouter basename="/admin"` dan provider `NotificationContext` + `AuthContext`.
- Autentikasi frontend memakai token ringan via endpoint `/api/auth/login`, disimpan di localStorage melalui `context/AuthContext.jsx`. Integrasi dengan Sanctum/Breeze tetap disarankan untuk produksi.
- Layout admin: `components/Layout.jsx` menyediakan navigasi, pencarian, badge user, dan tombol logout.
- Portal student (`components/StudentLayout.jsx`) kini menampilkan katalog kursus yang bisa langsung di-enroll, daftar kursus yang sudah diikuti lengkap dengan section, materi, serta kuis yang dapat diselesaikan dan tersimpan ke server untuk evaluasi.
- Portal instruktur (`components/InstructorLayout.jsx`) mengelola section, materi, dan kuis per kursus ajar dengan pengalaman serupa admin namun terbatas pada kelas masing-masing.
- Menu Master Data kini memisahkan Unit, Sub Unit, dan Course Classification di sidebar admin untuk navigasi yang lebih rapi.
- Halaman admin aktif mencakup Dashboard, Kursus, Siswa, Instruktur, Units, dan Sub Units yang terhubung langsung ke API.
- Tambahkan state management (Context/Redux/React Query) jika beban data semakin kompleks atau data real-time.

## 10. Perintah Berguna
```bash
# Generasi key baru
php artisan key:generate

# Membuat migration/model/controller baru
php artisan make:model Course -mcr

# Cek daftar route admin
php artisan route:list --path=admin

# Jalankan unit & feature test
php artisan test

# Format otomatis (Laravel Pint)
./vendor/bin/pint
```

## 11. Pipeline Pengembangan Disarankan
- Gunakan branch feature dan PR review (pastikan menjalankan `php artisan test`).
- Terapkan CI sederhana: `composer install`, `npm ci`, `php artisan test`, `npm run build`.
- Monitor perubahan schema dengan men-commit file migration baru.
- Buat dokumentasi API tambahan dengan Laravel Scribe atau OpenAPI.

## 12. Langkah Berikutnya
1. Integrasi autentikasi admin (Laravel Breeze + Sanctum) dan middleware otorisasi.
2. Tambah modul Course Builder (CRUD module, lesson, assignment) dengan FormRequest khusus.
3. Implementasi upload media (S3/Spaces) dan pencatatan progress real-time.
4. Tambahkan unit & feature test untuk endpoint kritikal (Course/Student/Instructor).
5. Kembangkan UI admin: tabel data, form, filter, chart (mis. Recharts, Chart.js).

---

Selamat melanjutkan pengembangan LMS! Dokumentasi ini diharapkan mempermudah onboarding tim, mempercepat debugging, dan menjaga konsistensi arsitektur ke depan.
