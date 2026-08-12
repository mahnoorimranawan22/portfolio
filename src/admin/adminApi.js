/**
 * Admin API client.
 * - Stores the JWT in localStorage and attaches it as a Bearer header.
 * - Unwraps the { data } envelope; throws Error with server message on failure.
 * - On 401, clears the token so the UI can bounce back to the login screen.
 */
const API_BASE = import.meta.env.VITE_API_URL || '/api';
const TOKEN_KEY = 'portfolio-admin-token';

export const adminAuth = {
    getToken() {
        try {
            return localStorage.getItem(TOKEN_KEY);
        } catch {
            return null;
        }
    },
    setToken(token) {
        try {
            if (token) localStorage.setItem(TOKEN_KEY, token);
            else localStorage.removeItem(TOKEN_KEY);
        } catch {
            /* storage unavailable */
        }
    },
    clear() {
        this.setToken(null);
    },
};

const REQUEST_TIMEOUT_MS = 8000;

async function request(path, { method = 'GET', body, auth = true } = {}) {
    const headers = { 'Content-Type': 'application/json' };
    if (auth) {
        const token = adminAuth.getToken();
        if (token) headers.Authorization = `Bearer ${token}`;
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    let res;
    try {
        res = await fetch(`${API_BASE}${path}`, {
            method,
            headers,
            body: body ? JSON.stringify(body) : undefined,
            signal: controller.signal,
        });
    } catch (err) {
        if (err.name === 'AbortError') throw new Error('Request timed out.');
        throw new Error('Cannot reach the API server. Is it running?');
    } finally {
        clearTimeout(timer);
    }

    const payload = await res.json().catch(() => null);

    if (res.status === 401) {
        adminAuth.clear();
        const err = new Error(payload?.error?.message || 'Session expired. Please log in again.');
        err.status = 401;
        throw err;
    }

    if (!res.ok) {
        const err = new Error(payload?.error?.message || `Request failed (${res.status})`);
        err.status = res.status;
        err.details = payload?.error?.details || null;
        throw err;
    }

    return payload?.data ?? payload;
}

export const adminApi = {
    // Auth
    login: (email, password) =>
        request('/admin/auth/login', { method: 'POST', body: { email, password }, auth: false }),

    // Overview
    getOverview: () => request('/admin/overview'),

    // Projects
    getProjects: (params = {}) => {
        const qs = new URLSearchParams(params).toString();
        return request(`/admin/projects${qs ? `?${qs}` : ''}`);
    },
    createProject: (project) => request('/admin/projects', { method: 'POST', body: project }),
    updateProject: (id, project) => request(`/admin/projects/${id}`, { method: 'PUT', body: project }),
    deleteProject: (id) => request(`/admin/projects/${id}`, { method: 'DELETE' }),

    // Skills
    getSkills: (params = {}) => {
        const qs = new URLSearchParams(params).toString();
        return request(`/admin/skills${qs ? `?${qs}` : ''}`);
    },
    createSkill: (skill) => request('/admin/skills', { method: 'POST', body: skill }),
    updateSkill: (id, skill) => request(`/admin/skills/${id}`, { method: 'PUT', body: skill }),
    deleteSkill: (id) => request(`/admin/skills/${id}`, { method: 'DELETE' }),
    addCategory: (name) => request('/admin/skills/categories', { method: 'POST', body: { name } }),
    deleteCategory: (name) =>
        request(`/admin/skills/categories/${encodeURIComponent(name)}`, { method: 'DELETE' }),

    // Experience
    getExperience: () => request('/admin/experience'),
    createExperience: (entry) => request('/admin/experience', { method: 'POST', body: entry }),
    updateExperience: (id, entry) => request(`/admin/experience/${id}`, { method: 'PUT', body: entry }),
    deleteExperience: (id) => request(`/admin/experience/${id}`, { method: 'DELETE' }),

    // Messages
    getMessages: (params = {}) => {
        const qs = new URLSearchParams(params).toString();
        return request(`/admin/messages${qs ? `?${qs}` : ''}`);
    },
    getMessage: (id) => request(`/admin/messages/${id}`),
    markMessageRead: (id, read = true) =>
        request(`/admin/messages/${id}/read`, { method: 'PATCH', body: { read } }),
    deleteMessage: (id) => request(`/admin/messages/${id}`, { method: 'DELETE' }),
};
