import { useEffect, useState } from 'react';
import { adminApi } from '../adminApi';
import { PageHeader, StatCard, EmptyState, LoadingState } from '../components/ui';

export default function Overview() {
    const [data, setData] = useState(null);
    const [error, setError] = useState('');

    useEffect(() => {
        let cancelled = false;
        adminApi
            .getOverview()
            .then((d) => { if (!cancelled) setData(d); })
            .catch((err) => { if (!cancelled) setError(err.message); });
        return () => { cancelled = true; };
    }, []);

    if (error) {
        return <div className="admin-alert admin-alert-error">{error}</div>;
    }
    if (!data) return <LoadingState />;

    const { counts, projectsByCategory, recentMessages, recentProjects } = data;
    const CATEGORY_LABELS = { ai: 'AI', fullstack: 'Full-Stack', frontend: 'Frontend' };

    return (
        <>
            <PageHeader eyebrow="Dashboard" title="Overview" />

            <div className="admin-stats-grid">
                <StatCard icon="fas fa-folder-open" label="Projects" value={counts.projects} tone="emerald" />
                <StatCard icon="fas fa-code" label="Skills" value={counts.skills} tone="coral" />
                <StatCard icon="fas fa-layer-group" label="Skill categories" value={counts.skillCategories} tone="charcoal" />
                <StatCard icon="fas fa-timeline" label="Experience entries" value={counts.experience} tone="cream" />
                <StatCard icon="fas fa-envelope" label="Messages" value={counts.messages} tone="charcoal" />
                <StatCard
                    icon="fas fa-envelope-open"
                    label="Unread messages"
                    value={counts.unreadMessages}
                    tone={counts.unreadMessages > 0 ? 'coral' : 'emerald'}
                />
            </div>

            <div className="admin-overview-grid">
                {/* Projects by category */}
                <section className="admin-panel">
                    <h3 className="admin-panel-title">Projects by category</h3>
                    <ul className="admin-bar-list">
                        {Object.entries(projectsByCategory).map(([category, count]) => (
                            <li key={category} className="admin-bar-row">
                                <span className="admin-bar-label">{CATEGORY_LABELS[category] || category}</span>
                                <div className="admin-bar-track">
                                    <div
                                        className="admin-bar-fill"
                                        style={{ width: `${(count / counts.projects) * 100}%` }}
                                    ></div>
                                </div>
                                <span className="admin-bar-value">{count}</span>
                            </li>
                        ))}
                    </ul>

                    <h3 className="admin-panel-title admin-panel-title-sm">Recent projects</h3>
                    <ul className="admin-chip-list">
                        {recentProjects.map((p) => (
                            <li key={p.id}>
                                <span className="admin-chip">
                                    {p.title}
                                    {p.featured && <i className="fas fa-star admin-chip-star" aria-hidden="true"></i>}
                                </span>
                            </li>
                        ))}
                    </ul>
                </section>

                {/* Recent messages */}
                <section className="admin-panel">
                    <h3 className="admin-panel-title">Recent messages</h3>
                    {recentMessages.length === 0 ? (
                        <EmptyState icon="fas fa-envelope-open" title="No messages yet" />
                    ) : (
                        <ul className="admin-message-mini-list">
                            {recentMessages.map((m) => (
                                <li key={m.id} className={`admin-message-mini${m.read ? '' : ' unread'}`}>
                                    <div className="admin-message-mini-dot" aria-hidden="true"></div>
                                    <div>
                                        <strong>{m.name}</strong>
                                        <span>{m.subject || 'No subject'}</span>
                                    </div>
                                    <small>{new Date(m.receivedAt).toLocaleDateString()}</small>
                                </li>
                            ))}
                        </ul>
                    )}
                </section>
            </div>
        </>
    );
}
