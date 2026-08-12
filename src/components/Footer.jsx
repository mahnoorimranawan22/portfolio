const SOCIAL_LINKS = [
    { icon: 'fa-github', label: 'GitHub', href: 'https://github.com/mahnoorimranawan22' },
    { icon: 'fa-linkedin-in', label: 'LinkedIn', href: 'https://www.linkedin.com/in/mahnoor-imran-8612b5375' },
    { icon: 'fa-twitter', label: 'Twitter', href: '#' },
    { icon: 'fa-instagram', label: 'Instagram', href: '#' },
];

export default function Footer() {
    return (
        <footer className="footer">
            <div className="footer-inner">
                <p className="footer-copy">
                    © 2026 <span className="gradient-text">Mahnoor Imran</span>. Built with ❤️ from scratch
                </p>
                <div className="social-row">
                    {SOCIAL_LINKS.map(({ icon, label, href }) => (
                        <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={label}>
                            <i className={`fab ${icon}`} aria-hidden="true"></i>
                        </a>
                    ))}
                </div>
            </div>
        </footer>
    );
}
