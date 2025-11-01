import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './login.css';

const roleOptions = [
    { value: 'admin', label: 'Command Lead', description: 'Full system control & analytics' },
    { value: 'instructor', label: 'Field Coach', description: 'Course management & training' },
    { value: 'student', label: 'Operative Trainee', description: 'Learning & mission progress' },
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
                        <strong>INTELIX LMS</strong>
                        <p>Intelligent Learning Management System for tactical training operations.</p>
                    </div>
                </div>
                <form className="auth-form" onSubmit={handleSubmit}>
                    <div>
                        <h1>Welcome Back</h1>
                        <p className="subtitle">
                            Sign in to your account to continue your training operations.
                        </p>
                    </div>

                    <label className="form-field">
                        <span>Email Address</span>
                        <input
                            type="email"
                            placeholder="your.email@intelix.local"
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
                            autoComplete="email"
                            required
                        />
                    </label>

                    <label className="form-field">
                        <span>Access Role</span>
                        <div className="role-selector">
                            {roleOptions.map((option) => (
                                <button
                                    key={option.value}
                                    type="button"
                                    className={`role-option${role === option.value ? ' active' : ''}`}
                                    onClick={() => setRole(option.value)}
                                >
                                    <div style={{ textAlign: 'left' }}>
                                        <div className="option-label">{option.label}</div>
                                        <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.1rem' }}>
                                            {option.description}
                                        </div>
                                    </div>
                                    <span className="option-pill">{option.value}</span>
                                </button>
                            ))}
                        </div>
                    </label>

                    {error ? <div className="auth-error">{error}</div> : null}

                    <button type="submit" className="auth-submit" disabled={isSubmitting}>
                        {isSubmitting ? 'Signing In...' : 'Sign In'}
                    </button>
                </form>
                <div className="auth-footer">
                    <span>Need assistance?</span>
                    <a href="mailto:support@intelix.local">Contact Support</a>
                </div>
            </div>
            <div className="auth-showcase">
                <div className="showcase-overlay" />
                <div className="showcase-content">
                    <h2>Advanced Training Platform</h2>
                    <p>
                        Experience the next generation of intelligent learning management designed for modern tactical operations and professional development.
                    </p>
                    <ul>
                        <li>Role-based dashboards with operational KPIs</li>
                        <li>Real-time notifications and adaptive analytics</li>
                        <li>Responsive interface for mission-critical operations</li>
                        <li>Secure and scalable training environment</li>
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
