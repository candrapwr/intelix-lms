import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './login.css';

const roleOptions = [
    { value: 'admin', label: 'Command Lead' },
    { value: 'instructor', label: 'Field Coach' },
    { value: 'student', label: 'Operative Trainee' },
];

export default function LoginPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const { login, isAuthenticated, user } = useAuth();

    const [email, setEmail] = useState('');
    const [role, setRole] = useState('admin');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (isAuthenticated && user?.role && location.pathname === '/login') {
            navigate(getDefaultDestination(user.role), { replace: true });
        }
    }, [isAuthenticated, location.pathname, navigate, user]);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setIsSubmitting(true);
        setError(null);

        try {
            if (!email) {
                throw new Error('Please enter your email address.');
            }

            login({ email, role });

            const redirectTo = location.state?.from?.pathname ?? getDefaultDestination(role);
            navigate(redirectTo, { replace: true });
        } catch (submitError) {
            setError(submitError.message ?? 'Unable to log in, please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="auth-shell">
            <div className="auth-gradient" />
            <div className="auth-card">
                <div className="auth-card__brand">
                    <span className="badge">IX</span>
                    <div>
                        <strong>INTELIX Access Gate</strong>
                        <p>Portal resmi pelatihan intelijen digital bagi command lead, field coach, dan operative.</p>
                    </div>
                </div>
                <form className="auth-form" onSubmit={handleSubmit}>
                    <h1>Secure access granted</h1>
                    <p className="subtitle">
                        Masuk menggunakan kredensial dan peran Anda untuk melanjutkan sesi latihan intelijen.
                    </p>

                    <label className="form-field">
                        <span>Email</span>
                        <input
                            type="email"
                            placeholder="agent@intelix.local"
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
                            autoComplete="email"
                            required
                        />
                    </label>

                    <label className="form-field">
                        <span>Login as</span>
                        <div className="role-selector">
                            {roleOptions.map((option) => (
                                <button
                                    key={option.value}
                                    type="button"
                                    className={`role-option${role === option.value ? ' active' : ''}`}
                                    onClick={() => setRole(option.value)}
                                >
                                    <span className="option-label">{option.label}</span>
                                    <span className="option-pill">{option.value}</span>
                                </button>
                            ))}
                        </div>
                    </label>

                    {error ? <div className="auth-error">{error}</div> : null}

                    <button type="submit" className="auth-submit" disabled={isSubmitting}>
                        {isSubmitting ? 'Authorizing...' : 'Initiate session'}
                    </button>
                </form>
                <div className="auth-footer">
                    <span>Need clearance?</span>
                    <a href="mailto:command@intelix.local">Hubungi INTELIX Command</a>
                </div>
            </div>
            <div className="auth-showcase">
                <div className="showcase-overlay" />
                <div className="showcase-content">
                    <h2>Asah ketajaman intelijen</h2>
                    <p>
                        Pantau kesiapan agen, rilis modul operasi, dan kawal simulasi misi dalam satu dek komando
                        modern. Berganti peran secara instan dan tetap selaras dengan taktik tim Anda.
                    </p>
                    <ul>
                        <li>Dashboard berbasis peran dengan KPI operasional</li>
                        <li>Notifikasi real-time dan intel analitik adaptif</li>
                        <li>Antarmuka responsif siap mendukung misi di berbagai perangkat</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}

function getDefaultDestination(currentRole) {
    if (currentRole === 'student') {
        return '/student';
    }

    if (currentRole === 'instructor') {
        return '/instructor';
    }

    return '/';
}
