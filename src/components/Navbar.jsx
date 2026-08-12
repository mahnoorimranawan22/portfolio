import { useEffect, useState } from 'react';

const NAV_LINKS = [
    { id: 'home', label: 'Home' },
    { id: 'about', label: 'About' },
    { id: 'skills', label: 'Skills' },
    { id: 'projects', label: 'Projects' },
    { id: 'showcase', label: 'Full-Stack' },
    { id: 'contact', label: 'Contact' },
];

export default function Navbar({ theme, setTheme }) {
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [active, setActive] = useState('home');

    useEffect(() => {
        // Throttle scroll handling with requestAnimationFrame
        let ticking = false;
        const onScroll = () => {
            if (ticking) return;
            ticking = true;
            requestAnimationFrame(() => {
                setScrolled(window.scrollY > 10);

                // Scroll-spy: highlight the section currently in view
                let current = 'home';
                for (const { id } of NAV_LINKS) {
                    const el = document.getElementById(id);
                    if (el && el.getBoundingClientRect().top <= 140) current = id;
                }
                setActive(current);
                ticking = false;
            });
        };

        window.addEventListener('scroll', onScroll, { passive: true });
        onScroll();
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    const handleScroll = (e, targetId) => {
        e.preventDefault();
        setIsOpen(false);
        const target = document.querySelector(targetId);
        if (target) {
            const navHeight = document.querySelector('.navbar')?.offsetHeight || 75;
            const targetPos = target.getBoundingClientRect().top + window.pageYOffset - navHeight;
            window.scrollTo({ top: targetPos, behavior: 'smooth' });
        }
    };

    const toggleTheme = () => {
        setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
    };

    return (
        <header className={`navbar-shell${scrolled ? ' scrolled' : ''}`}>
            <nav className="navbar" aria-label="Primary navigation">
                <a href="#home" className="logo" onClick={(e) => handleScroll(e, '#home')}>
                    Mahnoor.
                </a>

                <div className="nav-controls">
                    <button
                        className="theme-toggle-btn mobile-only"
                        aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
                        onClick={toggleTheme}
                    >
                        <i className={`fas ${theme === 'dark' ? 'fa-sun' : 'fa-moon'}`} aria-hidden="true"></i>
                    </button>

                    <button
                        className="hamburger"
                        aria-label="Toggle navigation menu"
                        aria-expanded={isOpen}
                        aria-controls="navLinks"
                        onClick={() => setIsOpen(!isOpen)}
                    >
                        <i className={`fas ${isOpen ? 'fa-xmark' : 'fa-bars'}`} aria-hidden="true"></i>
                    </button>
                </div>

                <ul className={`nav-links${isOpen ? ' open' : ''}`} id="navLinks">
                    {NAV_LINKS.map(({ id, label }) => (
                        <li key={id}>
                            <a
                                href={`#${id}`}
                                className={active === id ? 'active' : ''}
                                onClick={(e) => handleScroll(e, `#${id}`)}
                            >
                                {label}
                            </a>
                        </li>
                    ))}
                    <li className="desktop-theme-wrapper">
                        <button
                            className="theme-toggle-btn desktop-only"
                            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
                            onClick={toggleTheme}
                        >
                            <i className={`fas ${theme === 'dark' ? 'fa-sun' : 'fa-moon'}`} aria-hidden="true"></i>
                        </button>
                    </li>
                </ul>
            </nav>
        </header>
    );
}
