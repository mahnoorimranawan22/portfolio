import { useEffect } from 'react';

/* ── Page header ──────────────────────────────────────── */
export function PageHeader({ eyebrow, title, actions }) {
    return (
        <div className="admin-page-head">
            <div>
                {eyebrow && <p className="admin-eyebrow">{eyebrow}</p>}
                <h2>{title}</h2>
            </div>
            {actions && <div className="admin-page-actions">{actions}</div>}
        </div>
    );
}

/* ── Stat card (Overview) ─────────────────────────────── */
export function StatCard({ icon, label, value, tone = 'emerald' }) {
    return (
        <div className={`admin-stat admin-stat-${tone}`}>
            <div className="admin-stat-icon">
                <i className={icon} aria-hidden="true"></i>
            </div>
            <div className="admin-stat-body">
                <span className="admin-stat-value">{value}</span>
                <span className="admin-stat-label">{label}</span>
            </div>
        </div>
    );
}

/* ── Modal ────────────────────────────────────────────── */
export function Modal({ title, onClose, children, wide }) {
    useEffect(() => {
        const onKey = (e) => {
            if (e.key === 'Escape') onClose?.();
        };
        document.addEventListener('keydown', onKey);
        document.body.style.overflow = 'hidden';
        return () => {
            document.removeEventListener('keydown', onKey);
            document.body.style.overflow = '';
        };
    }, [onClose]);

    return (
        <div className="admin-modal-overlay" onClick={onClose}>
            <div
                className={`admin-modal${wide ? ' admin-modal-wide' : ''}`}
                role="dialog"
                aria-modal="true"
                aria-label={title}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="admin-modal-head">
                    <h3>{title}</h3>
                    <button className="admin-modal-close" onClick={onClose} aria-label="Close">
                        <i className="fas fa-times" aria-hidden="true"></i>
                    </button>
                </div>
                <div className="admin-modal-body">{children}</div>
            </div>
        </div>
    );
}

/* ── Confirm dialog ───────────────────────────────────── */
export function ConfirmDialog({ title, message, confirmLabel = 'Delete', onConfirm, onCancel, loading }) {
    return (
        <Modal title={title} onClose={onCancel}>
            <p className="admin-confirm-text">{message}</p>
            <div className="admin-modal-actions">
                <button className="admin-btn" onClick={onCancel} disabled={loading}>
                    Cancel
                </button>
                <button
                    className="admin-btn admin-btn-danger"
                    onClick={onConfirm}
                    disabled={loading}
                >
                    {loading ? (
                        <>
                            <i className="fas fa-spinner fa-spin" aria-hidden="true"></i> Working…
                        </>
                    ) : (
                        <>
                            <i className="fas fa-trash" aria-hidden="true"></i> {confirmLabel}
                        </>
                    )}
                </button>
            </div>
        </Modal>
    );
}

/* ── Empty state ──────────────────────────────────────── */
export function EmptyState({ icon = 'fas fa-inbox', title, hint }) {
    return (
        <div className="admin-empty">
            <i className={icon} aria-hidden="true"></i>
            <h4>{title}</h4>
            {hint && <p>{hint}</p>}
        </div>
    );
}

/* ── Loading state ────────────────────────────────────── */
export function LoadingState() {
    return (
        <div className="admin-empty">
            <i className="fas fa-spinner fa-spin" aria-hidden="true"></i>
            <p>Loading…</p>
        </div>
    );
}
