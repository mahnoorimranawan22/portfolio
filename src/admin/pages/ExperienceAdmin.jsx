import { useCallback, useEffect, useState } from 'react';
import { adminApi } from '../adminApi';
import { useAdminToast } from '../components/useAdminToast.jsx';
import {
    PageHeader, Modal, ConfirmDialog, EmptyState, LoadingState,
} from '../components/ui';

const EMPTY_ENTRY = { tag: '', period: '', title: '', description: '' };

export default function ExperienceAdmin() {
    const { toast, show } = useAdminToast();
    const [entries, setEntries] = useState(null);
    const [editing, setEditing] = useState(null);
    const [deleting, setDeleting] = useState(null);
    const [saving, setSaving] = useState(false);

    const load = useCallback(() => {
        adminApi
            .getExperience()
            .then(setEntries)
            .catch((err) => show(err.message, 'error'));
    }, [show]);

    useEffect(() => { load(); }, [load]);

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            if (editing.id) {
                await adminApi.updateExperience(editing.id, editing);
                show('Timeline entry updated.');
            } else {
                await adminApi.createExperience(editing);
                show('Timeline entry added.');
            }
            setEditing(null);
            load();
        } catch (err) {
            show(err.message, 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        setSaving(true);
        try {
            await adminApi.deleteExperience(deleting.id);
            show('Timeline entry deleted.');
            setDeleting(null);
            load();
        } catch (err) {
            show(err.message, 'error');
        } finally {
            setSaving(false);
        }
    };

    if (entries === null) return <LoadingState />;

    return (
        <>
            <PageHeader
                eyebrow="Content"
                title="Experience"
                actions={
                    <button className="admin-btn admin-btn-primary" onClick={() => setEditing({ ...EMPTY_ENTRY })}>
                        <i className="fas fa-plus" aria-hidden="true"></i> Add entry
                    </button>
                }
            />

            {entries.length === 0 ? (
                <EmptyState icon="fas fa-timeline" title="No timeline entries" hint="Add your first experience entry." />
            ) : (
                <div className="admin-panel">
                    <ul className="admin-experience-list">
                        {entries.map((entry) => (
                            <li key={entry.id} className="admin-experience-row">
                                <div className="admin-experience-node" aria-hidden="true"></div>
                                <div className="admin-experience-body">
                                    <div className="admin-experience-meta">
                                        <span className="admin-badge admin-badge-tag">{entry.tag}</span>
                                        {entry.period && <small>{entry.period}</small>}
                                    </div>
                                    <h3>{entry.title}</h3>
                                    <p>{entry.description}</p>
                                </div>
                                <div className="admin-row-actions">
                                    <button className="admin-icon-btn" onClick={() => setEditing({ ...entry })} aria-label={`Edit ${entry.title}`}>
                                        <i className="fas fa-pen" aria-hidden="true"></i>
                                    </button>
                                    <button className="admin-icon-btn admin-icon-btn-danger" onClick={() => setDeleting(entry)} aria-label={`Delete ${entry.title}`}>
                                        <i className="fas fa-trash" aria-hidden="true"></i>
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {editing && (
                <Modal
                    title={editing.id ? 'Edit timeline entry' : 'Add timeline entry'}
                    onClose={() => setEditing(null)}
                >
                    <form onSubmit={handleSave} className="admin-form">
                        <label className="admin-field">
                            <span>Title *</span>
                            <input
                                value={editing.title}
                                onChange={(e) => setEditing({ ...editing, title: e.target.value })}
                                required
                                placeholder="e.g. Full-Stack Transition"
                            />
                        </label>
                        <div className="admin-form-grid admin-form-grid-2">
                            <label className="admin-field">
                                <span>Tag</span>
                                <input
                                    value={editing.tag}
                                    onChange={(e) => setEditing({ ...editing, tag: e.target.value })}
                                    placeholder="2026 / Present / Academic"
                                />
                            </label>
                            <label className="admin-field">
                                <span>Period</span>
                                <input
                                    value={editing.period}
                                    onChange={(e) => setEditing({ ...editing, period: e.target.value })}
                                    placeholder="2026"
                                />
                            </label>
                        </div>
                        <label className="admin-field">
                            <span>Description *</span>
                            <textarea
                                value={editing.description}
                                onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                                required
                                rows="4"
                                placeholder="What did you do / learn?"
                            />
                        </label>
                        <div className="admin-modal-actions">
                            <button type="button" className="admin-btn" onClick={() => setEditing(null)} disabled={saving}>
                                Cancel
                            </button>
                            <button type="submit" className="admin-btn admin-btn-primary" disabled={saving}>
                                {saving ? (
                                    <>
                                        <i className="fas fa-spinner fa-spin" aria-hidden="true"></i> Saving…
                                    </>
                                ) : (
                                    <>
                                        <i className="fas fa-check" aria-hidden="true"></i> Save
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </Modal>
            )}

            {deleting && (
                <ConfirmDialog
                    title="Delete timeline entry"
                    message={`Delete "${deleting.title}" from the timeline?`}
                    onConfirm={handleDelete}
                    onCancel={() => setDeleting(null)}
                    loading={saving}
                />
            )}

            {toast}
        </>
    );
}
