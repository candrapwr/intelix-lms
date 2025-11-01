import './instructor.css';

const managedCourses = [
    {
        title: 'Advanced Recon Doctrine',
        status: 'Live',
        operatives: 64,
        modules: 18,
        impact: '4.9',
    },
    {
        title: 'Cyber Intelligence Bootcamp',
        status: 'Upcoming',
        operatives: 48,
        modules: 12,
        impact: 'Pending',
    },
    {
        title: 'Operational Debrief Mastery',
        status: 'Live',
        operatives: 87,
        modules: 16,
        impact: '4.7',
    },
];

export default function InstructorCoursesPage() {
    return (
        <div className="instructor-page">
            <header className="section-header">
                <div>
                    <h1>Mission portfolio</h1>
                    <p>Rilis modul operasi, pantau jumlah operative aktif, dan respons cepat permintaan intel.</p>
                </div>
                <button type="button" className="primary-button">
                    Tambah misi
                </button>
            </header>

            <table className="course-table">
                <thead>
                    <tr>
                        <th>Mission</th>
                        <th>Status</th>
                        <th>Operatives</th>
                        <th>Modules</th>
                        <th>Impact</th>
                        <th />
                    </tr>
                </thead>
                <tbody>
                    {managedCourses.map((course) => (
                        <tr key={course.title}>
                            <td>
                                <strong>{course.title}</strong>
                            </td>
                            <td>
                                <span className={`status-pill status-${course.status.toLowerCase()}`}>
                                    {course.status}
                                </span>
                            </td>
                            <td>{course.operatives}</td>
                            <td>{course.modules}</td>
                            <td>{course.impact}</td>
                            <td>
                                <button type="button" className="ghost-button">
                                    Kelola misi
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
