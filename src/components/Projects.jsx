import { useEffect, useState } from 'react';
import { api } from '../lib/api';

/* All real projects from https://github.com/mahnoorimranawan22 — repos, links,
   descriptions, tech stacks and features are taken from the actual repositories.
   Each card shows a real interface preview of the project. The data lives in
   the shared data/projects.json (single source of truth) — this component
   renders it immediately and upgrades it from the API when the backend is
   reachable (fallback keeps the grid alive offline). */
const GITHUB_BASE = 'https://github.com/mahnoorimranawan22';

import PROJECTS_DATA from '../../data/projects.json';

const CATEGORIES = [
    { id: 'all', label: 'All' },
    { id: 'ai', label: 'AI' },
    { id: 'fullstack', label: 'Full-Stack' },
    { id: 'frontend', label: 'Frontend' },
];

/* Category → colour mapping for the browser-chrome accent dots */
const CATEGORY_COLORS = {
    ai: '#f59e0b',
    fullstack: '#10b981',
    frontend: '#3b82f6',
};

/* Minimal browser-frame mockup showing the live interface */
function BrowserPreview({ project }) {
    const demoUrl = project.demo;
    const hasDemo = Boolean(demoUrl);

    return (
        <div className="project-cover">
            {hasDemo ? (
                <iframe
                    src={demoUrl}
                    title={`${project.title} live preview`}
                    className="project-iframe"
                    loading="lazy"
                    sandbox="allow-scripts allow-same-origin"
                    tabIndex={-1}
                />
            ) : (
                <div className="project-cover-fallback">
                    <span className="banner-icon">{project.icon}</span>
                </div>
            )}

            {/* Browser chrome overlay — always visible */}
            <div className="browser-chrome">
                <div className="browser-dots">
                    <span className="dot-red" style={{ background: '#ff5f57' }} />
                    <span className="dot-yellow" style={{ background: '#febc2e' }} />
                    <span className="dot-green" style={{ background: '#28c840' }} />
                </div>
                <div className="browser-url-bar">
                    <i className="fas fa-lock" style={{ fontSize: '0.6rem', color: 'var(--text-faint)' }} />
                    <span className="browser-url-text">
                        {hasDemo ? demoUrl.replace('https://', '') : 'No live demo'}
                    </span>
                </div>
                <div className="browser-actions">
                    {hasDemo && (
                        <a
                            href={demoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="browser-live-badge"
                            title="Open live demo"
                        >
                            <span className="live-dot" />
                            Live
                        </a>
                    )}
                </div>
            </div>

            {/* Hover overlay with CTA */}
            {hasDemo && (
                <a
                    href={demoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="project-preview-overlay"
                    aria-label={`Open ${project.title} live demo`}
                >
                    <i className="fas fa-external-link-alt" />
                    <span>Open Live Demo</span>
                </a>
            )}
        </div>
    );
}

export default function Projects() {
    const [filter, setFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [activeStudy, setActiveStudy] = useState(null);
    const [projects, setProjects] = useState(PROJECTS_DATA);

    // Prefer live API data; fall back silently to the bundled data when the
    // backend is offline (dev without server, static build preview, etc.).
    useEffect(() => {
        let cancelled = false;
        api.getProjects()
            .then((data) => {
                if (!cancelled && Array.isArray(data) && data.length > 0) {
                    setProjects(data);
                }
            })
            .catch(() => {
                /* Backend offline — bundled data already rendered. */
            });
        return () => {
            cancelled = true;
        };
    }, []);

    // Lock body-scroll while modal is open & handle ESC key
    useEffect(() => {
        if (activeStudy) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }

        const handleKeyDown = (e) => {
            if (e.key === 'Escape' && activeStudy) {
                setActiveStudy(null);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => {
            document.body.style.overflow = '';
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [activeStudy]);

    // Ensure freshly filtered cards are visible (reveal is normally added by the
    // global IntersectionObserver on first paint).
    useEffect(() => {
        const timer = setTimeout(() => {
            document
                .querySelectorAll('.projects-grid .reveal:not(.is-visible)')
                .forEach((el) => el.classList.add('is-visible'));
        }, 60);
        return () => clearTimeout(timer);
    }, [filter, searchTerm]);

    // Subtle 3D tilt on project cards (desktop mouse only).
    useEffect(() => {
        const grid = document.querySelector('.projects-grid');
        if (!grid) return;

        const onMove = (e) => {
            const card = e.target.closest('.project-card');
            if (!card) return;
            const rect = card.getBoundingClientRect();
            const px = (e.clientX - rect.left) / rect.width - 0.5;
            const py = (e.clientY - rect.top) / rect.height - 0.5;
            card.style.transition = 'transform 0.12s ease-out';
            card.style.transform = `perspective(900px) rotateY(${px * 5}deg) rotateX(${-py * 5}deg) translateY(-4px)`;
        };

        const onLeave = () => {
            grid.querySelectorAll('.project-card').forEach((c) => {
                c.style.transform = '';
                c.style.transition = '';
            });
        };

        grid.addEventListener('mousemove', onMove);
        grid.addEventListener('mouseleave', onLeave);
        return () => {
            grid.removeEventListener('mousemove', onMove);
            grid.removeEventListener('mouseleave', onLeave);
        };
    }, []);

    // Count projects per category
    const categoryCounts = {
        all: projects.length,
        ai: projects.filter((p) => p.category === 'ai').length,
        fullstack: projects.filter((p) => p.category === 'fullstack').length,
        frontend: projects.filter((p) => p.category === 'frontend').length,
    };

    const visibleProjects = projects.filter((p) => {
        const matchesCategory = filter === 'all' || p.category === filter;
        const searchLower = searchTerm.toLowerCase().trim();
        if (!searchLower) return matchesCategory;

        const matchesSearch =
            p.title.toLowerCase().includes(searchLower) ||
            p.description.toLowerCase().includes(searchLower) ||
            p.tech.some((t) => t.toLowerCase().includes(searchLower)) ||
            p.features.some((f) => f.toLowerCase().includes(searchLower));

        return matchesCategory && matchesSearch;
    });

    return (
        <section className="projects" id="projects">
            <div className="container">
                <div className="section-head reveal">
                    <p className="eyebrow">Portfolio</p>
                    <h2 className="section-title">
                        📁 My <span className="gradient-text">Projects</span>
                    </h2>
                    <p className="section-subtitle">
                        All of my real projects — from full-stack systems to AI-powered apps and responsive
                        websites
                    </p>
                </div>

                <div className="projects-toolbar reveal">
                    <div className="project-filters" role="group" aria-label="Filter projects by category">
                        {CATEGORIES.map((cat) => (
                            <button
                                key={cat.id}
                                className={`filter-btn${filter === cat.id ? ' active' : ''}`}
                                onClick={() => setFilter(cat.id)}
                                aria-pressed={filter === cat.id}
                            >
                                {cat.label} <span className="cat-badge">{categoryCounts[cat.id] || 0}</span>
                            </button>
                        ))}
                    </div>

                    <div className="project-search-box">
                        <i className="fas fa-search search-icon" aria-hidden="true"></i>
                        <input
                            type="text"
                            className="field search-field"
                            placeholder="Filter by keyword or tech (e.g. React, Express, PWA)..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            aria-label="Filter projects"
                        />
                        {searchTerm && (
                            <button
                                type="button"
                                className="clear-search-btn"
                                onClick={() => setSearchTerm('')}
                                aria-label="Clear search"
                            >
                                <i className="fas fa-times" aria-hidden="true"></i>
                            </button>
                        )}
                    </div>
                </div>

                {visibleProjects.length === 0 ? (
                    <div className="no-projects-found glass-panel reveal">
                        <i className="fas fa-folder-open empty-icon" aria-hidden="true"></i>
                        <h3>No projects match your filter</h3>
                        <p>Try searching for a different framework, keyword, or select another category above.</p>
                        <button
                            type="button"
                            className="btn btn-secondary btn-sm"
                            onClick={() => {
                                setFilter('all');
                                setSearchTerm('');
                            }}
                        >
                            Reset Filters
                        </button>
                    </div>
                ) : (
                    <div className="projects-grid">
                        {visibleProjects.map((project, index) => (
                            <article
                                className={`project-card glass-panel reveal${project.featured ? ' featured' : ''}`}
                                key={project.title}
                                style={{ '--reveal-delay': `${(index % 3) * 0.08}s` }}
                            >
                                {/* Browser mockup preview */}
                                <BrowserPreview project={project} />

                                <div className="project-body">
                                    {project.featured && (
                                        <span className="featured-badge-tag">
                                            <i className="fas fa-star" aria-hidden="true"></i> Featured Project
                                        </span>
                                    )}
                                    <div className="project-heading">
                                        <h3>{project.title}</h3>
                                        <span className="project-icon" aria-hidden="true">{project.icon}</span>
                                    </div>

                                    <p>{project.description}</p>

                                    <ul className="project-features">
                                        {project.features.map((feature) => (
                                            <li className="project-feature" key={feature}>
                                                <i className="fas fa-circle-check" aria-hidden="true"></i>
                                                <span>{feature}</span>
                                            </li>
                                        ))}
                                    </ul>

                                    <div className="project-tags">
                                        {project.tech.map((tag) => (
                                            <span className="chip" key={tag}>{tag}</span>
                                        ))}
                                    </div>

                                    <div className="project-links">
                                        {project.demo && (
                                            <a
                                                href={project.demo}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="btn btn-primary btn-sm project-demo-btn"
                                            >
                                                <i className="fas fa-rocket" aria-hidden="true"></i> Live Demo
                                            </a>
                                        )}
                                        <a
                                            href={project.repo}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="btn btn-secondary btn-sm"
                                        >
                                            <i className="fab fa-github" aria-hidden="true"></i> View Code
                                        </a>
                                        {project.caseStudy && (
                                            <button
                                                type="button"
                                                onClick={() => setActiveStudy(project)}
                                                className="btn btn-accent btn-sm"
                                            >
                                                <i className="fas fa-book-open" aria-hidden="true"></i> Case Study
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </article>
                        ))}
                    </div>
                )}

                <div className="projects-cta reveal">
                    <a
                        href={`${GITHUB_BASE}?tab=repositories`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-secondary btn-lg"
                    >
                        <i className="fab fa-github" aria-hidden="true"></i> Follow me on GitHub
                    </a>
                </div>
            </div>

            {/* Case Study Modal Overlay */}
            {activeStudy && (
                <div
                    className="case-study-overlay"
                    onClick={() => setActiveStudy(null)}
                    aria-modal="true"
                    role="dialog"
                >
                    <div className="case-study-modal" onClick={(e) => e.stopPropagation()}>
                        <button
                            className="close-modal-btn"
                            onClick={() => setActiveStudy(null)}
                            aria-label="Close Case Study"
                        >
                            <i className="fas fa-times" aria-hidden="true"></i>
                        </button>

                        <div className="case-study-grid">
                            <div className="case-study-sidebar">
                                <div className="case-study-header">
                                    <span className="case-study-icon" aria-hidden="true">{activeStudy.icon}</span>
                                    <h3>{activeStudy.title}</h3>
                                </div>
                                <div className="case-study-meta-list">
                                    <div className="meta-row">
                                        <strong>Role:</strong> <span>Full-Stack & AI Engineer</span>
                                    </div>
                                    <div className="meta-row">
                                        <strong>Category:</strong> <span>
                                            {activeStudy.category === 'ai'
                                                ? 'Artificial Intelligence'
                                                : activeStudy.category === 'fullstack'
                                                    ? 'Full-Stack Development'
                                                    : 'Frontend'}
                                        </span>
                                    </div>
                                    <div className="meta-row tech-meta-row">
                                        <strong>Technologies:</strong>
                                        <div className="meta-tags">
                                            {activeStudy.tech.map(t => <span key={t} className="chip">{t}</span>)}
                                        </div>
                                    </div>
                                </div>
                                <div className="case-study-sidebar-links">
                                    {activeStudy.demo && (
                                        <a
                                            href={activeStudy.demo}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="btn btn-primary w-full text-center"
                                        >
                                            <i className="fas fa-rocket" aria-hidden="true"></i> Live Demo
                                        </a>
                                    )}
                                    <a
                                        href={activeStudy.repo}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="btn btn-secondary w-full text-center"
                                    >
                                        <i className="fab fa-github" aria-hidden="true"></i> View Code
                                    </a>
                                </div>
                            </div>

                            <div className="case-study-content-scroll">
                                <section className="study-section">
                                    <h4><i className="fas fa-exclamation-circle" aria-hidden="true"></i> The Problem</h4>
                                    <p>{activeStudy.caseStudy.problem}</p>
                                </section>

                                <section className="study-section">
                                    <h4><i className="fas fa-lightbulb" aria-hidden="true"></i> The Solution</h4>
                                    <p>{activeStudy.caseStudy.solution}</p>
                                </section>

                                <section className="study-section">
                                    <h4><i className="fas fa-list-check" aria-hidden="true"></i> Key Features</h4>
                                    <ul className="study-bullet-list">
                                        {activeStudy.caseStudy.features.map(f => (
                                            <li key={f}>
                                                <i className="fas fa-circle-check" aria-hidden="true"></i>
                                                <span>{f}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </section>

                                <section className="study-section">
                                    <h4><i className="fas fa-sitemap" aria-hidden="true"></i> Architecture Flow</h4>
                                    <pre className="study-flow-diagram">{activeStudy.caseStudy.architecture}</pre>
                                </section>

                                <section className="study-section">
                                    <h4><i className="fas fa-code-fork" aria-hidden="true"></i> My Contribution</h4>
                                    <p>{activeStudy.caseStudy.contribution}</p>
                                </section>

                                <section className="study-section">
                                    <h4><i className="fas fa-triangle-exclamation" aria-hidden="true"></i> Challenges & Solutions</h4>
                                    <p>{activeStudy.caseStudy.challenges}</p>
                                </section>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
}
