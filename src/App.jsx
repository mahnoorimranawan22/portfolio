import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import CanvasPlexus from './components/CanvasPlexus';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import About from './components/About';
import Skills from './components/Skills';
import Projects from './components/Projects';
import FullStackShowcase from './components/FullStackShowcase';
import Contact from './components/Contact';
import Footer from './components/Footer';

// The private admin dashboard is code-split so it never bloats the public site.
const AdminApp = lazy(() => import('./admin/AdminApp'));

export default function App() {
    const [toast, setToast] = useState(null);
    const toastTimer = useRef(null);
    const [isAdminMode, setIsAdminMode] = useState(() => {
        const hash = window.location.hash;
        return hash === '#admin' || hash.startsWith('#/admin');
    });

    useEffect(() => {
        const handleHashChange = () => {
            const hash = window.location.hash;
            setIsAdminMode(hash === '#admin' || hash.startsWith('#/admin'));
        };
        window.addEventListener('hashchange', handleHashChange);
        return () => window.removeEventListener('hashchange', handleHashChange);
    }, []);

    const [theme, setTheme] = useState(() => {
        try {
            return localStorage.getItem('portfolio-theme') || 'dark';
        } catch {
            // Storage unavailable (e.g. private mode) — fall back to the default theme
            return 'dark';
        }
    });

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        try {
            localStorage.setItem('portfolio-theme', theme);
        } catch {
            // Storage unavailable — theme still applies for this session
        }
    }, [theme]);

    /* ── Global page effects: progress bar, reveal-on-scroll, back-to-top ── */
    useEffect(() => {
        const progressBar = document.getElementById('progressBar');
        const backToTop = document.getElementById('backToTop');
        const revealEls = document.querySelectorAll('.reveal');

        // Reveal-on-scroll (with a no-JS-safe fallback for old browsers)
        if ('IntersectionObserver' in window) {
            const observer = new IntersectionObserver(
                (entries) => {
                    entries.forEach((entry) => {
                        if (entry.isIntersecting) {
                            entry.target.classList.add('is-visible');
                            observer.unobserve(entry.target);
                        }
                    });
                },
                { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
            );
            revealEls.forEach((el) => observer.observe(el));
        } else {
            revealEls.forEach((el) => el.classList.add('is-visible'));
        }

        const onScroll = () => {
            const doc = document.documentElement;
            const scrollPercent = (doc.scrollTop / (doc.scrollHeight - doc.clientHeight)) * 100;
            if (progressBar) progressBar.style.width = `${scrollPercent}%`;
            if (backToTop) backToTop.classList.toggle('visible', doc.scrollTop > 400);
        };

        window.addEventListener('scroll', onScroll, { passive: true });
        onScroll();

        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    const showToast = (message) => {
        if (toastTimer.current) clearTimeout(toastTimer.current);
        setToast({ message, leaving: false });
        toastTimer.current = setTimeout(() => {
            setToast((current) => (current ? { ...current, leaving: true } : current));
            setTimeout(() => setToast(null), 400);
        }, 3600);
    };

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <>
            <CanvasPlexus theme={theme} />
            <div className="orb orb-crimson" aria-hidden="true"></div>
            <div className="orb orb-rose" aria-hidden="true"></div>
            <div className="progress-bar" id="progressBar" aria-hidden="true"></div>

            <Navbar theme={theme} setTheme={setTheme} />

            {isAdminMode ? (
                <Suspense
                    fallback={
                        <div
                            style={{
                                minHeight: '100vh',
                                display: 'grid',
                                placeItems: 'center',
                                background: '#17181a',
                                color: '#f5f1e8',
                                fontFamily: 'Outfit, Inter, system-ui, sans-serif',
                                gap: '10px',
                            }}
                        >
                            <i className="fas fa-spinner fa-spin" aria-hidden="true"></i>
                            <span>Loading admin dashboard…</span>
                        </div>
                    }
                >
                    <AdminApp />
                </Suspense>
            ) : (
                <main>
                    <Hero />
                    <About />
                    <Skills />
                    <Projects />
                    <FullStackShowcase />
                    <Contact onShowToast={showToast} />
                </main>
            )}

            <Footer />

            {toast && (
                <div className="toast-container" role="status" aria-live="polite">
                    <div className={`toast${toast.leaving ? ' toast-leaving' : ''}`}>
                        <i className="fas fa-check-circle" style={{ color: '#ef4444' }} aria-hidden="true"></i>
                        <span>{toast.message}</span>
                    </div>
                </div>
            )}

            <button className="back-to-top" id="backToTop" aria-label="Back to top" onClick={scrollToTop}>
                <i className="fas fa-arrow-up" aria-hidden="true"></i>
            </button>
        </>
    );
}
