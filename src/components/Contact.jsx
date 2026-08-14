import { useState } from 'react';
import { api } from '../lib/api';

const CONTACT_ITEMS = [
    { icon: 'fas fa-envelope', label: 'Email', value: 'mahnoorimranawan22@gmail.com', href: 'mailto:mahnoorimranawan22@gmail.com', copyable: true },
    { icon: 'fas fa-phone', label: 'Phone', value: '+92 346 2936378', href: 'tel:+923462936378', copyable: true },
    { icon: 'fas fa-map-marker-alt', label: 'Location', value: 'Pakistan' },
    { icon: 'fab fa-github', label: 'GitHub', value: 'github.com/mahnoorimranawan22', href: 'https://github.com/mahnoorimranawan22' },
    { icon: 'fab fa-linkedin', label: 'LinkedIn', value: 'linkedin.com/in/mahnoor-imran-8612b5375', href: 'https://www.linkedin.com/in/mahnoor-imran-8612b5375' },
];

const MESSAGE_PRESETS = [
    {
        label: '💼 Project / Freelance',
        subject: 'Inquiry regarding Full-Stack / Web Development Project',
        message: 'Hi Mahnoor, I saw your portfolio and would like to discuss a web application project opportunity with you.'
    },
    {
        label: '👋 Say Hello',
        subject: 'Networking & Connection',
        message: 'Hi Mahnoor! I enjoyed exploring your AI Interview Coach & portfolio projects. Would love to connect!'
    },
    {
        label: '🚀 Career Opportunity',
        subject: 'Software Engineer Role Opportunity',
        message: 'Hi Mahnoor, we have an exciting engineering role that aligns with your React and Express skill set. Let us know if you are open to chat!'
    }
];

export default function Contact({ onShowToast }) {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        setSubmitting(true);

        api.sendContact({ name, email, subject, message })
            .then(() => {
                onShowToast('📬 Thank you! Your message has been delivered.');
                setName('');
                setEmail('');
                setSubject('');
                setMessage('');
            })
            .catch(() => {
                // Backend offline — keep draft so visitor can retry or copy directly
                onShowToast('⚠️ API offline — draft saved! You can copy & email me directly.');
            })
            .finally(() => setSubmitting(false));
    };

    const handleApplyPreset = (preset) => {
        setSubject(preset.subject);
        setMessage(preset.message);
        onShowToast(`✨ Filled template: "${preset.label}"`);
    };

    const handleCopy = (text, label) => {
        navigator.clipboard.writeText(text).then(() => {
            onShowToast(`📋 Copied ${label} to clipboard!`);
        });
    };

    return (
        <section className="contact" id="contact">
            <div className="container">
                <div className="section-head reveal">
                    <p className="eyebrow">Contact</p>
                    <h2 className="section-title">
                        📬 Get In <span className="gradient-text">Touch</span>
                    </h2>
                    <p className="section-subtitle">Have a question or want to work together? Let's talk!</p>
                </div>

                <div className="contact-grid">
                    <div className="contact-intro reveal">
                        <h3>Let's Connect</h3>
                        <p>
                            I'm always open to new opportunities, collaborations, or just a friendly chat. Feel free
                            to reach out directly or use the quick contact form!
                        </p>

                        <div className="contact-list">
                            {CONTACT_ITEMS.map((item) => (
                                <div className="contact-item" key={item.label}>
                                    <i className={item.icon} aria-hidden="true"></i>
                                    <div className="contact-item-content">
                                        <h4>{item.label}</h4>
                                        <p>
                                            {item.href ? (
                                                <a
                                                    href={item.href}
                                                    target={item.href.startsWith('http') ? '_blank' : undefined}
                                                    rel="noopener noreferrer"
                                                >
                                                    {item.value}
                                                </a>
                                            ) : (
                                                item.value
                                            )}
                                        </p>
                                    </div>
                                    {item.copyable && (
                                        <button
                                            type="button"
                                            className="copy-item-btn"
                                            onClick={() => handleCopy(item.value, item.label)}
                                            title={`Copy ${item.label}`}
                                            aria-label={`Copy ${item.label}`}
                                        >
                                            <i className="fas fa-copy" aria-hidden="true"></i>
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    <form className="contact-form glass-panel reveal" style={{ '--reveal-delay': '0.1s' }} onSubmit={handleSubmit}>
                        <div className="preset-chips-container">
                            <span className="preset-chips-label"><i className="fas fa-magic" aria-hidden="true"></i> Quick Presets:</span>
                            <div className="preset-chips">
                                {MESSAGE_PRESETS.map((preset) => (
                                    <button
                                        key={preset.label}
                                        type="button"
                                        className="preset-chip"
                                        onClick={() => handleApplyPreset(preset)}
                                    >
                                        {preset.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <input
                            className="field"
                            type="text"
                            name="name"
                            placeholder="Your Name"
                            required
                            autoComplete="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                        <input
                            className="field"
                            type="email"
                            name="email"
                            placeholder="Your Email"
                            required
                            autoComplete="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                        <input
                            className="field"
                            type="text"
                            name="subject"
                            placeholder="Subject"
                            autoComplete="off"
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                        />
                        <textarea
                            className="field"
                            name="message"
                            placeholder="Your Message"
                            required
                            rows={4}
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                        ></textarea>
                        <button type="submit" className="btn btn-accent btn-lg" disabled={submitting}>
                            {submitting ? (
                                <>
                                    <i className="fas fa-spinner fa-spin" aria-hidden="true"></i> Processing...
                                </>
                            ) : (
                                <>
                                    <i className="fas fa-paper-plane" aria-hidden="true"></i> Send Message
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </section>
    );
}

