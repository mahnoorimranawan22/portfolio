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
                    <a href="#" className="btn btn-primary">
                        <i className="fas fa-download" aria-hidden="true"></i> Download CV
                    </a>
                    <a href="#contact" className="btn btn-secondary">
                        <i className="fas fa-envelope" aria-hidden="true"></i> Contact Me
                    </a>
                </div>

                <div className="social-row">
                    <a href="https://github.com/mahnoorimranawan22" target="_blank" rel="noopener noreferrer"
                        aria-label="GitHub">
                        <i className="fab fa-github" aria-hidden="true"></i>
                    </a>
                    <a href="https://www.linkedin.com/in/mahnoor-imran-8612b5375" target="_blank" rel="noopener noreferrer"
                        aria-label="LinkedIn">
                        <i className="fab fa-linkedin-in" aria-hidden="true"></i>
                    </a>
                    <a href="#" target="_blank" rel="noopener noreferrer" aria-label="Twitter">
                        <i className="fab fa-twitter" aria-hidden="true"></i>
                    </a>
                    <a href="#" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                        <i className="fab fa-instagram" aria-hidden="true"></i>
                    </a>
                </div>
            </div>

            <div className="hero-visual reveal" style={{ '--reveal-delay': '0.15s' }}>
                <img
                    className="hero-avatar"
                    width="320"
                    height="320"
                    src="https://ui-avatars.com/api/?name=Mahnoor+Imran&size=340&background=059669&color=fff&bold=true"
                    alt="Portrait of Mahnoor Imran"
                />
                <span className="hero-status">
                    <span className="dot" aria-hidden="true"></span> Open to opportunities
                </span>
            </div>
        </section>
    );
}
