import './student.css';

const enrolledCourses = [
    {
        id: 1,
        title: 'Signals Intelligence Playbook',
        instructor: 'Helena Martins',
        progress: 72,
        nextLesson: 'Directional antenna sweep protocol',
    },
    {
        id: 2,
        title: 'Human Terrain Analysis',
        instructor: 'Rahul Iyer',
        progress: 34,
        nextLesson: 'Cultural pattern recognition drill',
    },
    {
        id: 3,
        title: 'Covert Communications Lab',
        instructor: 'Fiona Grant',
        progress: 91,
        nextLesson: 'Encrypted burst transmission rehearsal',
    },
];

export default function StudentCoursesPage() {
    return (
        <div className="student-page">
            <header className="section-header">
                <div>
                    <h1>Operative curriculum</h1>
                    <p>Pantau progres latihan, tenggat evaluasi, dan drill berikutnya dalam satu portal.</p>
                </div>
                <button type="button" className="secondary-button">
                    Buka katalog intel
                </button>
            </header>

            <div className="course-grid">
                {enrolledCourses.map((course) => (
                    <article key={course.id} className="course-card">
                        <div className="card-header">
                            <span className="badge accent">Active</span>
                            <span className="course-progress">{course.progress}%</span>
                        </div>
                        <h2>{course.title}</h2>
                        <p className="course-instructor">dibimbing {course.instructor}</p>
                        <div className="course-meta">
                            <span>Next drill</span>
                            <strong>{course.nextLesson}</strong>
                        </div>
                        <button type="button" className="primary-button">
                            Lanjutkan latihan
                        </button>
                    </article>
                ))}
            </div>
        </div>
    );
}
