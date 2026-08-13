import { useState } from 'react';
import { api } from '../lib/api';

const CONTACT_ITEMS = [
    { icon: 'fas fa-envelope', label: 'Email', value: 'mahnoorimranawan22@gmail.com', href: 'mailto:mahnoorimranawan22@gmail.com' },
    { icon: 'fas fa-phone', label: 'Phone', value: '0346-2936378', href: 'tel:+923462936378' },
    { icon: 'fas fa-map-marker-alt', label: 'Location', value: 'Pakistan' },
    { icon: 'fab fa-github', label: 'GitHub', value: 'github.com/mahnoorimranawan22', href: 'https://github.com/mahnoorimranawan22' },
    { icon: 'fab fa-linkedin', label: 'LinkedIn', value: 'linkedin.com/in/mahnoor-imran-8612b5375', href: 'https://www.linkedin.com/in/mahnoor-imran-8612b5375' },
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
                // Backend offline — keep the draft so the visitor can retry or
                // copy it into an email instead of silently losing their message.
                onShowToast('⚠️ API offline — message not sent. Your draft is saved; email me directly.');
            })
            .finally(() => setSubmitting(false));
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
                            to reach out!
                        </p>

                        <div className="contact-list">
                            {CONTACT_ITEMS.map((item) => (
                                <div className="contact-item" key={item.label}>
                                    <i className={item.icon} aria-hidden="true"></i>
                                    <div>
                                        <h4>{item.label}</h4>
                                        <p>
                                            {item.href ? (
                                                <a href={item.href} target={item.href.startsWith('http') ? '_blank' : undefined}
                                                    rel="noopener noreferrer">
                                                    {item.value}
                                                </a>
                                            ) : (
                                                item.value
                                            )}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <form className="contact-form glass-panel reveal" style={{ '--reveal-delay': '0.1s' }} onSubmit={handleSubmit}>
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
