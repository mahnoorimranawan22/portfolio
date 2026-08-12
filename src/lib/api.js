/**
 * API client for the portfolio Express backend.
 * Uses bearer authorization parameters when admin token is stored.
 */
const API_BASE = import.meta.env.VITE_API_URL || '/api';
const REQUEST_TIMEOUT_MS = 4000;

async function request(path, options = {}) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    const headers = { 'Content-Type': 'application/json' };
    const token = localStorage.getItem('admin_token');
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    try {
        const res = await fetch(`${API_BASE}${path}`, {
            headers,
            ...options,
            signal: controller.signal,
        });
        const body = await res.json().catch(() => null);
        if (!res.ok) {
            const message = body?.error?.message || `Request failed (${res.status})`;
            const error = new Error(message);
            error.details = body?.error?.details || null;
            error.status = res.status;
            throw error;
        }
        return body?.data ?? body;
    } catch (err) {
        if (err.name === 'AbortError') {
            const timeoutError = new Error('API request timed out');
            timeoutError.status = 0;
            throw timeoutError;
        }
        throw err;
    } finally {
        clearTimeout(timer);
    }
}

export const api = {
    // Public APIs
    getProjects: (params = {}) => {
        const qs = new URLSearchParams(params).toString();
        return request(`/projects${qs ? `?${qs}` : ''}`);
    },
    getSkills: () => request('/skills'),
    getExperience: () => request('/experience'),
    sendContact: (payload) =>
        request('/contact', { method: 'POST', body: JSON.stringify(payload) }),

    // Admin Auth
    login: (email, password) =>
        request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),

    // Admin Inbox Messages
    getInbox: () => request('/contact'),
    deleteInboxMessage: (id) => request(`/contact/${id}`, { method: 'DELETE' }),

    // Admin Projects CRUD
    addProject: (payload) => request('/projects', { method: 'POST', body: JSON.stringify(payload) }),
    updateProject: (id, payload) => request(`/projects/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
    deleteProject: (id) => request(`/projects/${id}`, { method: 'DELETE' }),

    // Admin Skills CRUD
    updateSkills: (payload) => request('/skills', { method: 'PUT', body: JSON.stringify(payload) }),

    // Admin Experience CRUD
    addExperience: (payload) => request('/experience', { method: 'POST', body: JSON.stringify(payload) }),
    updateExperience: (index, payload) => request(`/experience/${index}`, { method: 'PUT', body: JSON.stringify(payload) }),
    deleteExperience: (index) => request(`/experience/${index}`, { method: 'DELETE' }),
};
