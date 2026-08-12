import { useEffect, useState } from 'react';
import { adminAuth } from './adminApi';
import AdminLogin from './AdminLogin';
import Overview from './pages/Overview';
import ProjectsAdmin from './pages/ProjectsAdmin';
import SkillsAdmin from './pages/SkillsAdmin';
import ExperienceAdmin from './pages/ExperienceAdmin';
import MessagesAdmin from './pages/MessagesAdmin';
import './admin.css';

const PAGES = [
    { id: 'overview', label: 'Overview', icon: 'fas fa-gauge-high' },
    { id: 'projects', label: 'Projects', icon: 'fas fa-folder-open' },
    { id: 'skills', label: 'Skills', icon: 'fas fa-code' },
    { id: 'experience', label: 'Experience', icon: 'fas fa-timeline' },
    { id: 'messages', label: 'Messages', icon: 'fas fa-envelope-open-text' },
];

/** Parse the current hash into the active admin page id. */
function useAdminRoute() {
    const [page, setPage] = useState(() => {
        const match = window.location.hash.match(/^#\/admin\/([a-z]+)/);
        return match && PAGES.some((p) => p.id === match[1]) ? match[1] : 'overview';
    });

    useEffect(() => {
        const onHash = () => {
            const match = window.location.hash.match(/^#\/admin\/([a-z]+)/);
            setPage(match && PAGES.some((p) => p.id === match[1]) ? match[1] : 'overview');
        };
        window.addEventListener('hashchange', onHash);
        return () => window.removeEventListener('hashchange', onHash);
    }, []);

    return [page, (next) => { window.location.hash = `/admin/${next}`; }];
}

export default function AdminApp() {
    const [page, goTo] = useAdminRoute();
    const [token, setToken] = useState(() => adminAuth.getToken());
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const handleLogout = () => {
        adminAuth.clear();
        setToken(null);
        window.location.hash = '/admin';
    };

    // If not authenticated, show only the login screen.
    if (!token) {
        return (
            <AdminLogin
                onLogin={(newToken) => {
                    adminAuth.setToken(newToken);
                    setToken(newToken);
                }}
            />
        );
    }

    const renderPage = () => {
        switch (page) {
            case 'projects': return <ProjectsAdmin />;
            case 'skills': return <SkillsAdmin />;
            case 'experience': return <ExperienceAdmin />;
            case 'messages': return <MessagesAdmin />;
            default: return <Overview />;
        }
    };

    return (
        <div className="admin-shell">
            {/* Sidebar */}
            <aside className={`admin-sidebar${sidebarOpen ? ' open' : ''}`}>
                <div className="admin-brand">
                    <span className="admin-brand-mark">MI</span>
                    <div>
                        <strong>Portfolio Admin</strong>
                        <small>Mahnoor Imran</small>
                    </div>
                </div>

                <nav className="admin-nav" aria-label="Admin navigation">
                    {PAGES.map((p) => (
                        <button
                            key={p.id}
                            className={`admin-nav-item${page === p.id ? ' active' : ''}`}
                            onClick={() => { goTo(p.id); setSidebarOpen(false); }}
                        >
                            <i className={p.icon} aria-hidden="true"></i>
                            <span>{p.label}</span>
                        </button>
                    ))}
                </nav>

                <div className="admin-sidebar-footer">
                    <a href="#home" className="admin-back-link" title="Back to the public site">
                        <i className="fas fa-arrow-left" aria-hidden="true"></i> View public site
                    </a>
                    <button className="admin-logout" onClick={handleLogout}>
                        <i className="fas fa-right-from-bracket" aria-hidden="true"></i> Log out
                    </button>
                </div>
            </aside>

            {sidebarOpen && <div className="admin-scrim" onClick={() => setSidebarOpen(false)}></div>}

            {/* Main */}
            <div className="admin-main">
                <header className="admin-topbar">
                    <button
                        className="admin-burger"
                        aria-label="Toggle sidebar"
                        onClick={() => setSidebarOpen(true)}
                    >
                        <i className="fas fa-bars" aria-hidden="true"></i>
                    </button>
                    <h1 className="admin-page-title">
                        {PAGES.find((p) => p.id === page)?.label || 'Overview'}
                    </h1>
                    <span className="admin-topbar-email">
                        <i className="fas fa-shield-halved" aria-hidden="true"></i> Private area
                    </span>
                </header>

                <main className="admin-content">{renderPage()}</main>
            </div>
        </div>
    );
}
