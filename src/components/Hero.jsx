import { useEffect, useState } from 'react';

const PHRASES = [
    'React & Modern Frameworks',
    'BS Software Engineering Student',
    'AI Tools Interoperation',
    'Clean System Architecture',
];

export default function Hero() {
    const [text, setText] = useState('');
    const [phraseIndex, setPhraseIndex] = useState(0);
    const [charIndex, setCharIndex] = useState(0);
    const [isDeleting, setIsDeleting] = useState(false);
    const [showCvModal, setShowCvModal] = useState(false);

    useEffect(() => {
        let timer;
        const currentPhrase = PHRASES[phraseIndex];

        if (isDeleting) {
            if (charIndex > 0) {
                timer = setTimeout(() => {
                    setText(currentPhrase.substring(0, charIndex - 1));
                    setCharIndex((prev) => prev - 1);
                }, 60);
            } else {
                timer = setTimeout(() => {
                    setIsDeleting(false);
                    setPhraseIndex((prev) => (prev + 1) % PHRASES.length);
                }, 500);
            }
        } else if (charIndex < currentPhrase.length) {
            timer = setTimeout(() => {
                setText(currentPhrase.substring(0, charIndex + 1));
                setCharIndex((prev) => prev + 1);
            }, 120);
        } else {
            // Fully typed — hold before deleting
            timer = setTimeout(() => setIsDeleting(true), 2000);
        }

        return () => clearTimeout(timer);
    }, [charIndex, isDeleting, phraseIndex]);

    // Handle ESC key to close CV modal
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape' && showCvModal) {
                setShowCvModal(false);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [showCvModal]);

    const handlePrintCv = () => {
        window.print();
    };

    return (
        <section className="hero" id="home">
            <div className="hero-content reveal">
                <p className="hero-greeting">
                    <i className="fas fa-hand-sparkles" aria-hidden="true"></i> Hello, I'm
                </p>
                <h1 className="hero-title">
                    Mahnoor <span className="gradient-text">Imran</span>
                </h1>
                <p className="hero-subtitle">
                    Full-Stack Developer & <span className="gradient-text">AI Enthusiast</span>
                </p>
                <p className="hero-focus">
                    Specializing in <span className="typewriter-text" aria-live="polite">{text}</span>
                </p>
                <p className="hero-lead">
                    Passionate about building performant web applications, modern UI/UX design, and exploring AI connections. Currently pursuing BS Software Engineering while mastering React, Git workflows, and API architectures.
                </p>

                <div className="hero-actions">
                    <button
                        type="button"
                        className="btn btn-primary"
                        onClick={() => setShowCvModal(true)}
                    >
                        <i className="fas fa-file-pdf" aria-hidden="true"></i> View / Download CV
                    </button>
                    <a href="#contact" className="btn btn-secondary">
                        <i className="fas fa-envelope" aria-hidden="true"></i> Contact Me
                    </a>
                </div>

                <div className="social-row">
                    <a
                        href="https://github.com/mahnoorimranawan22"
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="GitHub"
                        title="GitHub Profile"
                    >
                        <i className="fab fa-github" aria-hidden="true"></i>
                    </a>
                    <a
                        href="https://www.linkedin.com/in/mahnoor-imran-8612b5375"
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="LinkedIn"
                        title="LinkedIn Profile"
                    >
                        <i className="fab fa-linkedin-in" aria-hidden="true"></i>
                    </a>
                    <a
                        href="mailto:mahnoorimranawan22@gmail.com"
                        aria-label="Email"
                        title="Send Email"
                    >
                        <i className="fas fa-envelope" aria-hidden="true"></i>
                    </a>
                    <a
                        href="tel:+923462936378"
                        aria-label="Phone"
                        title="Call Phone"
                    >
                        <i className="fas fa-phone" aria-hidden="true"></i>
                    </a>
                </div>
            </div>

            <div className="hero-visual reveal" style={{ '--reveal-delay': '0.15s' }}>
                <div className="avatar-wrapper">
                    <img
                        className="hero-avatar"
                        width="320"
                        height="320"
                        src="./mahnoor.png"
                        alt="Portrait of Mahnoor Imran"
                    />
                    <div className="avatar-ring" aria-hidden="true"></div>
                </div>
            </div>

            {/* Interactive Resume Modal */}
            {showCvModal && (
                <div
                    className="cv-modal-overlay"
                    onClick={() => setShowCvModal(false)}
                    aria-modal="true"
                    role="dialog"
                >
                    <div className="cv-modal glass-panel" onClick={(e) => e.stopPropagation()}>
                        <div className="cv-modal-header">
                            <div className="cv-header-title">
                                <i className="fas fa-id-card gradient-icon" aria-hidden="true"></i>
                                <div>
                                    <h3>Mahnoor Imran — Curriculum Vitae</h3>
                                    <p className="cv-sub">BS Software Engineering Student & Full-Stack Developer</p>
                                </div>
                            </div>
                            <div className="cv-header-actions">
                                <button
                                    type="button"
                                    className="btn btn-primary btn-sm"
                                    onClick={handlePrintCv}
                                >
                                    <i className="fas fa-print" aria-hidden="true"></i> Print / Save PDF
                                </button>
                                <button
                                    type="button"
                                    className="close-modal-btn"
                                    onClick={() => setShowCvModal(false)}
                                    aria-label="Close CV Modal"
                                >
                                    <i className="fas fa-times" aria-hidden="true"></i>
                                </button>
                            </div>
                        </div>

                        <div className="cv-modal-body">
                            <section className="cv-section">
                                <h4><i className="fas fa-user-graduate" aria-hidden="true"></i> Executive Summary</h4>
                                <p>
                                    Motivated Software Engineering student with strong expertise in full-stack web development, React 19 single-page applications, Express/Node REST APIs, SQLite & MongoDB databases, and Groq/OpenAI LLM prompt orchestration. Proven track record of shipping installable PWAs and modular desktop/mobile software.
                                </p>
                            </section>

                            <div className="cv-grid-2">
                                <section className="cv-section">
                                    <h4><i className="fas fa-university" aria-hidden="true"></i> Education</h4>
                                    <div className="cv-entry">
                                        <strong>BS Software Engineering</strong>
                                        <span className="cv-date">Current Student</span>
                                        <p>Focusing on OOP, System Modularity, Design Patterns, Database Architecture, and Analysis of Algorithms.</p>
                                    </div>
                                </section>

                                <section className="cv-section">
                                    <h4><i className="fas fa-location-dot" aria-hidden="true"></i> Contact Information</h4>
                                    <ul className="cv-contact-list">
                                        <li><i className="fas fa-envelope" aria-hidden="true"></i> mahnoorimranawan22@gmail.com</li>
                                        <li><i className="fas fa-phone" aria-hidden="true"></i> +92 346 2936378</li>
                                        <li><i className="fab fa-github" aria-hidden="true"></i> github.com/mahnoorimranawan22</li>
                                        <li><i className="fab fa-linkedin" aria-hidden="true"></i> linkedin.com/in/mahnoor-imran-8612b5375</li>
                                    </ul>
                                </section>
                            </div>

                            <section className="cv-section">
                                <h4><i className="fas fa-layer-group" aria-hidden="true"></i> Technical Stack & Competencies</h4>
                                <div className="cv-skills-chips">
                                    <span className="chip">React 19 & Vite</span>
                                    <span className="chip">JavaScript (ES6+)</span>
                                    <span className="chip">Node.js & Express</span>
                                    <span className="chip">SQLite & MongoDB</span>
                                    <span className="chip">Groq / OpenAI API Integration</span>
                                    <span className="chip">Progressive Web Apps (PWA)</span>
                                    <span className="chip">Tailwind CSS & Glassmorphism</span>
                                    <span className="chip">Git & GitHub Workflows</span>
                                    <span className="chip">RESTful API Design</span>
                                    <span className="chip">JWT Session Security</span>
                                </div>
                            </section>

                            <section className="cv-section">
                                <h4><i className="fas fa-rocket" aria-hidden="true"></i> Key Featured Projects</h4>
                                <div className="cv-projects-list">
                                    <div className="cv-project-item">
                                        <strong>AI Interview Coach</strong> — <em>React 19, Express, SQLite, Groq API</em>
                                        <p>Interactive mock interview app with adaptive LLM questioning difficulty and real-time response feedback.</p>
                                    </div>
                                    <div className="cv-project-item">
                                        <strong>AI-StudyMate</strong> — <em>JavaScript, Node.js, Express, PWA</em>
                                        <p>Comprehensive learning dashboard combining study quizzes, AI assistant chat, and offline service-worker caching.</p>
                                    </div>
                                    <div className="cv-project-item">
                                        <strong>Task Management System</strong> — <em>Node.js, Express, MongoDB, JWT</em>
                                        <p>Full-stack productivity workspace featuring bcrypt encryption, token-based authorization, and real-time task filtering.</p>
                                    </div>
                                </div>
                            </section>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
}

