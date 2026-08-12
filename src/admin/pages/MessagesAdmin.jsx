import { useCallback, useEffect, useState } from 'react';
import { adminApi } from '../adminApi';
import { useAdminToast } from '../components/useAdminToast.jsx';
import {
    PageHeader, Modal, ConfirmDialog, EmptyState, LoadingState,
} from '../components/ui';

export default function MessagesAdmin() {
    const { toast, show } = useAdminToast();
    const [messages, setMessages] = useState(null);
    const [search, setSearch] = useState('');
    const [status, setStatus] = useState('all');
    const [viewing, setViewing] = useState(null);
    const [deleting, setDeleting] = useState(null);
    const [saving, setSaving] = useState(false);

    const load = useCallback(() => {
        adminApi
            .getMessages({ search, status })
            .then(setMessages)
            .catch((err) => show(err.message, 'error'));
    }, [search, status, show]);

    useEffect(() => {
        const t = setTimeout(load, 250);
        return () => clearTimeout(t);
    }, [load]);

    const toggleRead = async (message) => {
        try {
            await adminApi.markMessageRead(message.id, !message.read);
            if (viewing?.id === message.id) setViewing({ ...viewing, read: !message.read });
            load();
        } catch (err) {
            show(err.message, 'error');
        }
    };

    const openView = async (message) => {
        try {
            const detail = await adminApi.getMessage(message.id);
            setViewing(detail);
            if (!detail.read) {
                await adminApi.markMessageRead(detail.id, true);
                setViewing({ ...detail, read: true });
                load();
            }
        } catch (err) {
            show(err.message, 'error');
        }
    };

    const handleDelete = async () => {
        setSaving(true);
        try {
            await adminApi.deleteMessage(deleting.id);
            show('Message deleted.');
            setDeleting(null);
            if (viewing?.id === deleting.id) setViewing(null);
            load();
        } catch (err) {
            show(err.message, 'error');
        } finally {
            setSaving(false);
        }
    };

    if (messages === null) return <LoadingState />;

    return (
        <>
            <PageHeader eyebrow="Inbox" title="Messages" />

            <div className="admin-toolbar">
                <div className="admin-search">
                    <i className="fas fa-search" aria-hidden="true"></i>
                    <input
                        type="search"
                        placeholder="Search messages…"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        aria-label="Search messages"
                    />
                </div>
                <div className="admin-filter">
                    <label className="sr-only" htmlFor="msg-status">Status</label>
                    <select id="msg-status" value={status} onChange={(e) => setStatus(e.target.value)}>
                        <option value="all">All messages</option>
                        <option value="unread">Unread</option>
                        <option value="read">Read</option>
                    </select>
                </div>
            </div>

            {messages.length === 0 ? (
                <EmptyState icon="fas fa-envelope-open" title="No messages found" hint="Contact form submissions will appear here." />
            ) : (
                <div className="admin-panel">
                    <ul className="admin-msg-list">
                        {messages.map((m) => (
                            <li key={m.id} className={`admin-msg-row${m.read ? '' : ' unread'}`}>
                                <button className="admin-msg-main" onClick={() => openView(m)}>
                                    <span className="admin-msg-avatar" aria-hidden="true">
                                        {m.name.charAt(0).toUpperCase()}
                                    </span>
                                    <span className="admin-msg-info">
                                        <span className="admin-msg-top">
                                            <strong>{m.name}</strong>
                                            <small>{new Date(m.receivedAt).toLocaleString()}</small>
                                        </span>
                                        <span className="admin-msg-subject">{m.subject || '(no subject)'}</span>
                                        <span className="admin-msg-preview">{m.message}</span>
                                    </span>
                                </button>
                                <div className="admin-msg-actions">
                                    <button
                                        className="admin-icon-btn"
                                        onClick={() => toggleRead(m)}
                                        aria-label={m.read ? 'Mark as unread' : 'Mark as read'}
                                        title={m.read ? 'Mark as unread' : 'Mark as read'}
                                    >
                                        <i className={`fas ${m.read ? 'fa-envelope-open' : 'fa-envelope'}`} aria-hidden="true"></i>
                                    </button>
                                    <button
                                        className="admin-icon-btn admin-icon-btn-danger"
                                        onClick={() => setDeleting(m)}
                                        aria-label="Delete message"
                                    >
                                        <i className="fas fa-trash" aria-hidden="true"></i>
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* View message */}
            {viewing && (
                <Modal title="Message" onClose={() => setViewing(null)}>
                    <div className="admin-msg-detail">
                        <div className="admin-msg-detail-head">
                            <span className="admin-msg-avatar" aria-hidden="true">
                                {viewing.name.charAt(0).toUpperCase()}
                            </span>
                            <div>
                                <h4>{viewing.name}</h4>
                                <a href={`mailto:${viewing.email}`} className="admin-link">{viewing.email}</a>
                            </div>
                        </div>
                        <p className="admin-msg-detail-meta">
                            Received {new Date(viewing.receivedAt).toLocaleString()}
                            {viewing.subject && <> · Subject: <strong>{viewing.subject}</strong></>}
                        </p>
                        <div className="admin-msg-detail-body">{viewing.message}</div>
                        <div className="admin-modal-actions">
                            <button
                                className="admin-btn"
                                onClick={() => toggleRead(viewing)}
                            >
                                <i className={`fas ${viewing.read ? 'fa-envelope' : 'fa-envelope-open'}`} aria-hidden="true"></i>
                                {viewing.read ? 'Mark as unread' : 'Mark as read'}
                            </button>
                            <button className="admin-btn admin-btn-danger" onClick={() => setDeleting(viewing)}>
                                <i className="fas fa-trash" aria-hidden="true"></i> Delete
                            </button>
                        </div>
                    </div>
                </Modal>
            )}

            {deleting && (
                <ConfirmDialog
                    title="Delete message"
                    message={`Delete the message from "${deleting.name}"? This cannot be undone.`}
                    onConfirm={handleDelete}
                    onCancel={() => setDeleting(null)}
                    loading={saving}
                />
            )}

            {toast}
        </>
    );
}
