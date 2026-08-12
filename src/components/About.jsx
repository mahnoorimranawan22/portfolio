import { useEffect, useState } from 'react';
import { api } from '../lib/api';

/* Shared real experience/timeline data (data/experience.json) — same file the
   backend API serves. Rendered instantly, upgraded from the API when reachable. */
import TIMELINE_DATA from '../../data/experience.json';

export default function About() {
    const [timeline, setTimeline] = useState(TIMELINE_DATA);

    // Prefer live API data; fall back silently to bundled data when offline.
    useEffect(() => {
        let cancelled = false;
        api.getExperience()
            .then((data) => {
                if (!cancelled && Array.isArray(data) && data.length > 0) {
                    setTimeline(data);
                }
            })
            .catch(() => {
                /* Backend offline — bundled data already rendered. */
            });
        return () => {
            cancelled = true;
        };
    }, []);

    return (
        <section className="about" id="about">
            <div className="container">
                <div className="section-head reveal">
                    <p className="eyebrow">About Me</p>
                    <h2 className="section-title">
                        About <span className="gradient-text">Me</span>
                    </h2>
                    <p className="section-subtitle">BS Software Engineering student driving technology at the intersection of robust web architectures and intelligent systems</p>
                </div>

                <div className="about-grid">
                    {/* Left Sidebar Card */}
                    <div className="about-sidebar reveal">
                        <div className="about-image">
                            <img
                                width="400"
                                height="400"
                                loading="lazy"
                                src="https://ui-avatars.com/api/?name=Mahnoor+Imran&size=400&background=059669&color=fff&bold=true"
                                alt="Portrait of Mahnoor Imran"
                            />
                        </div>
                        <div className="about-sidebar-info">
                            <div className="about-info-item">
                                <i className="fas fa-user" aria-hidden="true"></i> <span>Mahnoor Imran</span>
                            </div>
                            <div className="about-info-item">
                                <i className="fas fa-graduation-cap" aria-hidden="true"></i>{' '}
                                <span>BS Software Engineering</span>
                            </div>
                            <div className="about-info-item">
                                <i className="fas fa-map-marker-alt" aria-hidden="true"></i> <span>Pakistan</span>
                            </div>
                            <div className="about-info-item">
                                <i className="fas fa-envelope" aria-hidden="true"></i>{' '}
                                <span>mahnoorimranawan22@gmail.com</span>
                            </div>
                        </div>
                        <a href="#contact" className="btn btn-primary w-full text-center">
                            <i className="fas fa-comments" aria-hidden="true"></i> Let's Talk
                        </a>
                    </div>

                    {/* Right Main Body Content */}
                    <div className="about-main reveal" style={{ '--reveal-delay': '0.12s' }}>
                        <div className="about-intro">
                            <h3>Background & Focus</h3>
                            <p>
                                I am an aspiring software engineer majoring in Software Engineering, building highly responsive frontend web layouts and modular back-end API persistence layers. My design ethos centers around clean architecture compliance, fast learning agility, and robust prompt modeling integrations.
                            </p>
                        </div>

                        {/* Specialty pillars */}
                        <div className="about-pillars">
                            <div className="about-pillar-card glass-panel">
                                <div className="pillar-header">
                                    <i className="fas fa-graduation-cap" aria-hidden="true"></i>
                                    <h4>Software Engineering</h4>
                                </div>
                                <p>Pursuing rigorous BS studies in system modularity, design patterns, and algorithmic structures.</p>
                            </div>
                            <div className="about-pillar-card glass-panel">
                                <div className="pillar-header">
                                    <i className="fas fa-cubes" aria-hidden="true"></i>
                                    <h4>Full-Stack Development</h4>
                                </div>
                                <p>Building highly responsive frontend layouts in React, complemented by standard REST backend middleware.</p>
                            </div>
                            <div className="about-pillar-card glass-panel">
                                <div className="pillar-header">
                                    <i className="fas fa-brain" aria-hidden="true"></i>
                                    <h4>AI & Automation</h4>
                                </div>
                                <p>Designing local setups matching AI web components, prompt pipelines, and agentic workflows.</p>
                            </div>
                        </div>

                        {/* Goals */}
                        <div className="about-objectives">
                            <h4>Career Goals & Strengths</h4>
                            <p>
                                <strong>Strengths:</strong> Fast learning agility, clean architecture compliance, collaborative Git workflows, and analytical debugging.
                            </p>
                            <p>
                                <strong>Vocation:</strong> Aiming to build modern scalable cloud web apps that weave together automated intelligence layers and state-of-the-art developer tools.
                            </p>
                        </div>

                        {/* Education/Career Timeline */}
                        <div className="about-timeline">
                            <h3 className="timeline-section-title">
                                <i className="fas fa-history" aria-hidden="true"></i> Education & Journey
                            </h3>
                            <div className="timeline-container">
                                <div className="timeline-track"></div>
                                <div className="timeline-events">
                                    {timeline.map((event, index) => (
                                        <div className="timeline-event" key={event.id || index}>
                                            <div className="timeline-node"></div>
                                            <div className="timeline-meta-box">
                                                <span className="timeline-tag">{event.tag}</span>
                                                <h4>{event.title}</h4>
                                            </div>
                                            <p>{event.description}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </section>
    );
}
