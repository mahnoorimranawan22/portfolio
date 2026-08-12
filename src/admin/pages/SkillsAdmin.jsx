import { useCallback, useEffect, useState } from 'react';
import { adminApi } from '../adminApi';
import { useAdminToast } from '../components/useAdminToast.jsx';
import {
    PageHeader, Modal, ConfirmDialog, EmptyState, LoadingState,
} from '../components/ui';

const ICON_CHOICES = [
    'fab fa-html5', 'fab fa-css3-alt', 'fab fa-js', 'fab fa-react', 'fab fa-node-js',
    'fas fa-server', 'fas fa-database', 'fas fa-leaf', 'fas fa-network-wired', 'fas fa-file-code',
    'fas fa-wand-magic-sparkles', 'fas fa-brain', 'fas fa-cloud', 'fas fa-terminal',
    'fab fa-git-alt', 'fab fa-github', 'fas fa-code', 'fas fa-laptop-code', 'fas fa-mobile-screen',
];

export default function SkillsAdmin() {
    const { toast, show } = useAdminToast();
    const [skills, setSkills] = useState(null);
    const [search, setSearch] = useState('');
    const [editing, setEditing] = useState(null);      // { category, skill } for edit
    const [creating, setCreating] = useState(null);    // { category } for create
    const [newCategory, setNewCategory] = useState('');
    const [deleting, setDeleting] = useState(null);    // { type: 'skill'|'category', ... }
    const [saving, setSaving] = useState(false);

    const load = useCallback(() => {
        adminApi
            .getSkills({ search })
            .then(setSkills)
            .catch((err) => show(err.message, 'error'));
    }, [search, show]);

    useEffect(() => {
        const t = setTimeout(load, 250);
        return () => clearTimeout(t);
    }, [load]);

    const handleSaveSkill = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            if (editing) {
                await adminApi.updateSkill(editing.skill.id, {
                    category: editing.category,
                    name: editing.skill.name,
                    icon: editing.skill.icon,
                    level: editing.skill.level,
                });
                show('Skill updated.');
            } else if (creating) {
                await adminApi.createSkill(creating);
                show('Skill added.');
            }
            setEditing(null);
            setCreating(null);
            load();
        } catch (err) {
            show(err.message, 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleAddCategory = async () => {
        const name = newCategory.trim();
        if (!name) return;
        setSaving(true);
        try {
            await adminApi.addCategory(name);
            setNewCategory('');
            show('Category added.');
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
            if (deleting.type === 'skill') {
                await adminApi.deleteSkill(deleting.id);
                show('Skill deleted.');
            } else {
                await adminApi.deleteCategory(deleting.name);
                show('Category deleted.');
            }
            setDeleting(null);
            load();
        } catch (err) {
            show(err.message, 'error');
        } finally {
            setSaving(false);
        }
    };

    if (skills === null) return <LoadingState />;

    return (
        <>
            <PageHeader
                eyebrow="Content"
                title="Skills"
                actions={
                    <button className="admin-btn admin-btn-primary" onClick={() => setCreating({ category: Object.keys(skills)[0] || '', name: '', icon: 'fas fa-code', level: '60%' })}>
                        <i className="fas fa-plus" aria-hidden="true"></i> Add skill
                    </button>
                }
            />

            <div className="admin-toolbar">
                <div className="admin-search">
                    <i className="fas fa-search" aria-hidden="true"></i>
                    <input
                        type="search"
                        placeholder="Search skills…"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        aria-label="Search skills"
                    />
                </div>
                <div className="admin-add-category">
                    <input
                        value={newCategory}
                        onChange={(e) => setNewCategory(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') handleAddCategory(); }}
                        placeholder="New category name…"
                        aria-label="New category name"
                    />
                    <button className="admin-btn admin-btn-secondary" onClick={handleAddCategory} disabled={saving}>
                        <i className="fas fa-layer-group" aria-hidden="true"></i> Add category
                    </button>
                </div>
            </div>

            {Object.keys(skills).length === 0 ? (
                <EmptyState icon="fas fa-code" title="No skills found" />
            ) : (
                <div className="admin-skills-grid">
                    {Object.entries(skills).map(([category, list]) => (
                        <section className="admin-panel admin-skill-cat" key={category}>
                            <div className="admin-skill-cat-head">
                                <h3>{category}</h3>
                                <div className="admin-row-actions">
                                    <button
                                        className="admin-icon-btn"
                                        onClick={() => setCreating({ category, name: '', icon: 'fas fa-code', level: '60%' })}
                                        aria-label={`Add skill to ${category}`}
                                        title="Add skill"
                                    >
                                        <i className="fas fa-plus" aria-hidden="true"></i>
                                    </button>
                                    <button
                                        className="admin-icon-btn admin-icon-btn-danger"
                                        onClick={() => setDeleting({ type: 'category', name: category })}
                                        aria-label={`Delete category ${category}`}
                                        title="Delete category"
                                    >
                                        <i className="fas fa-trash" aria-hidden="true"></i>
                                    </button>
                                </div>
                            </div>

                            {list.length === 0 ? (
                                <p className="admin-muted admin-skill-empty">No skills in this category yet.</p>
                            ) : (
                                <ul className="admin-skill-list">
                                    {list.map((skill) => (
                                        <li key={skill.id} className="admin-skill-row">
                                            <div className="admin-skill-row-info">
                                                <i className={`${skill.icon} admin-skill-row-icon`} aria-hidden="true"></i>
                                                <div>
                                                    <strong>{skill.name}</strong>
                                                    <small>{skill.level}</small>
                                                </div>
                                            </div>
                                            <div className="admin-row-actions">
                                                <button
                                                    className="admin-icon-btn"
                                                    onClick={() => setEditing({ category, skill })}
                                                    aria-label={`Edit ${skill.name}`}
                                                >
                                                    <i className="fas fa-pen" aria-hidden="true"></i>
                                                </button>
                                                <button
                                                    className="admin-icon-btn admin-icon-btn-danger"
                                                    onClick={() => setDeleting({ type: 'skill', id: skill.id, name: skill.name })}
                                                    aria-label={`Delete ${skill.name}`}
                                                >
                                                    <i className="fas fa-trash" aria-hidden="true"></i>
                                                </button>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </section>
                    ))}
                </div>
            )}

            {/* Skill modal (create + edit) */}
            {(creating || editing) && (
                <Modal
                    title={editing ? `Edit ${editing.skill.name}` : 'Add skill'}
                    onClose={() => { setCreating(null); setEditing(null); }}
                >
                    <form onSubmit={handleSaveSkill} className="admin-form">
                        <label className="admin-field">
                            <span>Category</span>
                            <select
                                value={creating ? creating.category : editing.category}
                                onChange={(e) =>
                                    creating
                                        ? setCreating({ ...creating, category: e.target.value })
                                        : setEditing({ ...editing, category: e.target.value })
                                }
                                required
                            >
                                {Object.keys(skills).map((c) => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </label>
                        <label className="admin-field">
                            <span>Skill name *</span>
                            <input
                                value={creating ? creating.name : editing.skill.name}
                                onChange={(e) =>
                                    creating
                                        ? setCreating({ ...creating, name: e.target.value })
                                        : setEditing({ ...editing, skill: { ...editing.skill, name: e.target.value } })
                                }
                                required
                                placeholder="e.g. TypeScript"
                            />
                        </label>
                        <label className="admin-field">
                            <span>Level</span>
                            <div className="admin-level-input">
                                <input
                                    value={creating ? creating.level : editing.skill.level}
                                    onChange={(e) =>
                                        creating
                                            ? setCreating({ ...creating, level: e.target.value })
                                            : setEditing({ ...editing, skill: { ...editing.skill, level: e.target.value } })
                                    }
                                    placeholder="75%"
                                    pattern="\d{1,3}%"
                                />
                            </div>
                        </label>
                        <div className="admin-field">
                            <span>Icon</span>
                            <div className="admin-icon-picker">
                                {ICON_CHOICES.map((icon) => (
                                    <button
                                        key={icon}
                                        type="button"
                                        className={`admin-icon-option${(creating ? creating.icon : editing.skill.icon) === icon ? ' active' : ''}`}
                                        onClick={() =>
                                            creating
                                                ? setCreating({ ...creating, icon })
                                                : setEditing({ ...editing, skill: { ...editing.skill, icon } })
                                        }
                                        aria-label={`Icon ${icon}`}
                                    >
                                        <i className={icon} aria-hidden="true"></i>
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="admin-modal-actions">
                            <button type="button" className="admin-btn" onClick={() => { setCreating(null); setEditing(null); }} disabled={saving}>
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
                    title={deleting.type === 'skill' ? 'Delete skill' : 'Delete category'}
                    message={
                        deleting.type === 'skill'
                            ? `Delete the skill "${deleting.name}"?`
                            : `Delete the category "${deleting.name}" and all ${skills[deleting.name]?.length || 0} skills inside it?`
                    }
                    onConfirm={handleDelete}
                    onCancel={() => setDeleting(null)}
                    loading={saving}
                />
            )}

            {toast}
        </>
    );
}
