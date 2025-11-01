import './instructor.css';

const quickStats = [
    { label: 'Active missions', value: '5', detail: '3 live / 2 in prep' },
    { label: 'Intel satisfaction', value: '4.8', detail: '128 tactical reviews' },
    { label: 'Operatives coached', value: '156', detail: '12 fresh recruits' },
];

export default function InstructorHomePage() {
    return (
        <div className="instructor-page">
            <section className="under-development-section">
                <h2>Dashboard - Under Development</h2>
                <p>This dashboard page is currently under development and will be available soon.</p>
            </section>
        </div>
    );
}
