import { useCallback, useEffect, useState } from 'react';
import { adminApi } from '../adminApi';
import { useAdminToast } from '../components/useAdminToast.jsx';
import {
    PageHeader, Modal, ConfirmDialog, EmptyState, LoadingState,
} from '../components/ui';

const EMPTY_PROJECT = {
    title: '', icon: '🚀', category: 'frontend', featured: false,
    description: '', repo: '',
    tech: [], features: [],
};

export default function ProjectsAdmin() {
    const { toast, show } = useAdminToast();
    const [projects, setProjects] = useState(null);
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('all');
    const [editing, setEditing] = useState(null);   // project or EMPTY_PROJECT for create
    const [deleting, setDeleting] = useState(null);
    const [saving, setSaving] = useState(false);
    const [techInput, setTechInput] = useState('');
    const [featureInput, setFeatureInput] = useState('');

    const load = useCallback(() => {
        adminApi
            .getProjects({ search, category })
            .then(setProjects)
            .catch((err) => show(err.message, 'error'));
    }, [search, category, show]);

    useEffect(() => {
        const t = setTimeout(load, 250);
        return () => clearTimeout(t);
    }, [load]);

    const openCreate = () => {
        setEditing({ ...EMPTY_PROJECT });
        setTechInput('');
        setFeatureInput('');
    };

    const openEdit = (project) => {
        setEditing({ ...project, tech: [...(project.tech || [])], features: [...(project.features || [])] });
        setTechInput('');
        setFeatureInput('');
    };

    const addChip = (key, input, setInput) => {
        const value = input.trim();
        if (!value) return;
        setEditing((cur) => ({ ...cur, [key]: [...(cur[key] || []), value] }));
        setInput('');
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            if (editing.id) {
                await adminApi.updateProject(editing.id, editing);
                show('Project updated.');
            } else {
                await adminApi.createProject(editing);
                show('Project created.');
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
            await adminApi.deleteProject(deleting.id);
            show('Project deleted.');
            setDeleting(null);
            load();
        } catch (err) {
            show(err.message, 'error');
        } finally {
            setSaving(false);
        }
    };

    if (projects === null) return <LoadingState />;

    return (
        <>
            <PageHeader
                eyebrow="Content"
                title="Projects"
                actions={
                    <button className="admin-btn admin-btn-primary" onClick={openCreate}>
                        <i className="fas fa-plus" aria-hidden="true"></i> Add project
                    </button>
                }
            />

            <div className="admin-toolbar">
                <div className="admin-search">
                    <i className="fas fa-search" aria-hidden="true"></i>
                    <input
                        type="search"
                        placeholder="Search projects…"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        aria-label="Search projects"
                    />
                </div>
                <div className="admin-filter">
                    <label className="sr-only" htmlFor="proj-cat">Category</label>
                    <select id="proj-cat" value={category} onChange={(e) => setCategory(e.target.value)}>
                        <option value="all">All categories</option>
                        <option value="ai">AI</option>
                        <option value="fullstack">Full-Stack</option>
                        <option value="frontend">Frontend</option>
                    </select>
                </div>
            </div>

            {projects.length === 0 ? (
                <EmptyState icon="fas fa-folder-open" title="No projects found" hint="Try adjusting the search or filters." />
            ) : (
                <div className="admin-table-wrap">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Project</th>
                                <th>Category</th>
                                <th>Tech</th>
                                <th className="admin-th-center">Featured</th>
                                <th className="admin-th-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {projects.map((p) => (
                                <tr key={p.id}>
                                    <td>
                                        <div className="admin-cell-title">
                                            <span className="admin-cell-icon" aria-hidden="true">{p.icon}</span>
                                            <div>
                                                <strong>{p.title}</strong>
                                                <small>{p.description}</small>
                                            </div>
                                        </div>
                                    </td>
                                    <td><span className={`admin-badge admin-badge-${p.category}`}>{p.category}</span></td>
                                    <td>
                                        <div className="admin-cell-chips">
                                            {p.tech.slice(0, 3).map((t) => <span key={t}>{t}</span>)}
                                            {p.tech.length > 3 && <span className="admin-cell-more">+{p.tech.length - 3}</span>}
                                        </div>
                                    </td>
                                    <td className="admin-th-center">
                                        {p.featured ? (
                                            <span className="admin-badge admin-badge-featured"><i className="fas fa-star" aria-hidden="true"></i></span>
                                        ) : (
                                            <span className="admin-muted">—</span>
                                        )}
                                    </td>
                                    <td className="admin-th-right">
                                        <div className="admin-row-actions">
                                            <button className="admin-icon-btn" onClick={() => openEdit(p)} aria-label={`Edit ${p.title}`}>
                                                <i className="fas fa-pen" aria-hidden="true"></i>
                                            </button>
                                            <button
                                                className="admin-icon-btn admin-icon-btn-danger"
                                                onClick={() => setDeleting(p)}
                                                aria-label={`Delete ${p.title}`}
                                            >
                                                <i className="fas fa-trash" aria-hidden="true"></i>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Add / Edit modal */}
            {editing && (
                <Modal
                    title={editing.id ? 'Edit project' : 'Add project'}
                    onClose={() => setEditing(null)}
                    wide
                >
                    <form onSubmit={handleSave} className="admin-form">
                        <div className="admin-form-grid">
                            <label className="admin-field admin-field-span2">
                                <span>Title *</span>
                                <input
                                    value={editing.title}
                                    onChange={(e) => setEditing({ ...editing, title: e.target.value })}
                                    required
                                    placeholder="Project name"
                                />
                            </label>
                            <label className="admin-field">
                                <span>Icon (emoji)</span>
                                <input
                                    value={editing.icon}
                                    onChange={(e) => setEditing({ ...editing, icon: e.target.value })}
                                    placeholder="🚀"
                                />
                            </label>
                            <label className="admin-field">
                                <span>Category</span>
                                <select
                                    value={editing.category}
                                    onChange={(e) => setEditing({ ...editing, category: e.target.value })}
                                >
                                    <option value="frontend">Frontend</option>
                                    <option value="fullstack">Full-Stack</option>
                                    <option value="ai">AI</option>
                                </select>
                            </label>
                            <label className="admin-field admin-field-span2">
                                <span>Description</span>
                                <textarea
                                    value={editing.description}
                                    onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                                    rows="2"
                                    placeholder="Short professional description"
                                />
                            </label>
                            <label className="admin-field">
                                <span>GitHub repo URL</span>
                                <input
                                    value={editing.repo}
                                    onChange={(e) => setEditing({ ...editing, repo: e.target.value })}
                                    placeholder="https://github.com/…"
                                />
                            </label>
                            {/* Tech chips */}
                            <div className="admin-field admin-field-span2">
                                <span>Technologies</span>
                                <div className="admin-chip-input">
                                    <div className="admin-chips">
                                        {(editing.tech || []).map((t) => (
                                            <span key={t} className="admin-chip">
                                                {t}
                                                <button
                                                    type="button"
                                                    onClick={() => setEditing({ ...editing, tech: editing.tech.filter((x) => x !== t) })}
                                                    aria-label={`Remove ${t}`}
                                                >
                                                    <i className="fas fa-xmark" aria-hidden="true"></i>
                                                </button>
                                            </span>
                                        ))}
                                    </div>
                                    <input
                                        value={techInput}
                                        onChange={(e) => setTechInput(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') { e.preventDefault(); addChip('tech', techInput, setTechInput); }
                                        }}
                                        placeholder="Type a technology and press Enter"
                                    />
                                </div>
                            </div>

                            {/* Feature chips */}
                            <div className="admin-field admin-field-span2">
                                <span>Key features</span>
                                <div className="admin-chip-input">
                                    <div className="admin-chips">
                                        {(editing.features || []).map((f) => (
                                            <span key={f} className="admin-chip">
                                                {f}
                                                <button
                                                    type="button"
                                                    onClick={() => setEditing({ ...editing, features: editing.features.filter((x) => x !== f) })}
                                                    aria-label={`Remove feature`}
                                                >
                                                    <i className="fas fa-xmark" aria-hidden="true"></i>
                                                </button>
                                            </span>
                                        ))}
                                    </div>
                                    <input
                                        value={featureInput}
                                        onChange={(e) => setFeatureInput(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') { e.preventDefault(); addChip('features', featureInput, setFeatureInput); }
                                        }}
                                        placeholder="Type a feature and press Enter"
                                    />
                                </div>
                            </div>

                            <label className="admin-check admin-field-span2">
                                <input
                                    type="checkbox"
                                    checked={Boolean(editing.featured)}
                                    onChange={(e) => setEditing({ ...editing, featured: e.target.checked })}
                                />
                                <span>Featured project</span>
                            </label>
                        </div>

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
                                        <i className="fas fa-check" aria-hidden="true"></i> {editing.id ? 'Save changes' : 'Create project'}
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </Modal>
            )}

            {deleting && (
                <ConfirmDialog
                    title="Delete project"
                    message={`Are you sure you want to delete "${deleting.title}"? This cannot be undone.`}
                    onConfirm={handleDelete}
                    onCancel={() => setDeleting(null)}
                    loading={saving}
                />
            )}

            {toast}
        </>
    );
}
