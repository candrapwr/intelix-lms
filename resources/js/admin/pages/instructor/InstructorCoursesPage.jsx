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
            <section className="under-development-section">
                <h2>Courses - Under Development</h2>
                <p>This courses management page is currently under development and will be available soon.</p>
            </section>
        </div>
    );
}
