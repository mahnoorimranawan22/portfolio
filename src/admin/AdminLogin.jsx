import { useState } from 'react';
import { adminApi } from './adminApi';

export default function AdminLogin({ onLogin }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const data = await adminApi.login(email.trim(), password);
            onLogin(data.token);
        } catch (err) {
            setError(err.message || 'Login failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="admin-login-wrap">
            <div className="admin-login-card">
                <div className="admin-login-brand">
                    <span className="admin-brand-mark">MI</span>
                </div>
                <h1 className="admin-login-title">Admin Dashboard</h1>
                <p className="admin-login-sub">Private access — sign in to manage the portfolio.</p>

                <form onSubmit={handleSubmit} className="admin-login-form">
                    <label className="admin-field">
                        <span>Email</span>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="admin@example.com"
                            autoComplete="username"
                            required
                        />
                    </label>
                    <label className="admin-field">
                        <span>Password</span>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            autoComplete="current-password"
                            required
                        />
                    </label>

                    {error && <div className="admin-alert admin-alert-error">{error}</div>}

                    <button type="submit" className="admin-btn admin-btn-primary admin-btn-block" disabled={loading}>
                        {loading ? (
                            <>
                                <i className="fas fa-spinner fa-spin" aria-hidden="true"></i> Signing in…
                            </>
                        ) : (
                            <>
                                <i className="fas fa-lock" aria-hidden="true"></i> Sign in
                            </>
                        )}
                    </button>
                </form>

                <a href="#home" className="admin-login-back">
                    <i className="fas fa-arrow-left" aria-hidden="true"></i> Back to the public site
                </a>
            </div>
        </div>
    );
}
