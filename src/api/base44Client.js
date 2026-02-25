/**
 * api.js — Central API client for QuestBridge AI frontend
 * All requests go to VITE_API_URL (Express backend)
 */

const BASE_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '' : 'http://localhost:5000');

// ── Token helpers ──────────────────────────────────────────────
export const getToken = () => localStorage.getItem('authToken');
export const setToken = (t) => localStorage.setItem('authToken', t);
export const clearToken = () => localStorage.removeItem('authToken');
export const getStoredUser = () => {
    try { return JSON.parse(localStorage.getItem('currentUser')); } catch { return null; }
};
export const setStoredUser = (u) => localStorage.setItem('currentUser', JSON.stringify(u));
export const clearStoredUser = () => localStorage.removeItem('currentUser');

// ── Core fetch wrapper ─────────────────────────────────────────
async function request(method, path, body = null, auth = false) {
    const headers = { 'Content-Type': 'application/json' };
    if (auth) {
        const token = getToken();
        if (token) headers['Authorization'] = `Bearer ${token}`;
    }
    const options = { method, headers };
    if (body) options.body = JSON.stringify(body);

    const res = await fetch(`${BASE_URL}${path}`, options);
    const contentType = res.headers.get('content-type');
    const data = contentType?.includes('application/json') ? await res.json() : await res.text();

    if (!res.ok) throw new Error(data?.error || data || `Request failed: ${res.status}`);
    return data;
}

// ── API object ─────────────────────────────────────────────────
export const api = {

    // ── Auth ───────────────────────────────────────────────────
    auth: {
        me: () => getStoredUser(),
        login: async (email, password) => {
            const data = await request('POST', '/api/auth/login', { email, password });
            setToken(data.token);
            setStoredUser(data.user);
            return data.user;
        },
        signup: async (userData) => {
            const data = await request('POST', '/api/auth/signup', userData);
            setToken(data.token);
            setStoredUser(data.user);
            return data.user;
        },
        logout: () => {
            clearToken();
            clearStoredUser();
        },
        updateMe: (updates) => {
            const current = getStoredUser() || {};
            const updated = { ...current, ...updates };
            setStoredUser(updated);
            return updated;
        },
        isLoggedIn: () => !!getToken() && !!getStoredUser(),
        isHost: () => getStoredUser()?.role === 'host',
        isAttendee: () => getStoredUser()?.role === 'attendee',
    },

    // ── AI ─────────────────────────────────────────────────────
    ai: {
        generateQuiz: (topic) => request('POST', '/api/ai/quiz', { topic }, true)
    },

    // ── Events ─────────────────────────────────────────────────
    events: {
        list: () => request('GET', '/api/events'),
        myEvents: async () => {
            const events = await request('GET', '/api/events/my', null, true);
            // Enrich each event with request counts from join_requests
            try {
                const counts = await Promise.all(
                    events.map(e => request('GET', `/api/requests/event/${e.id}`, null, true)
                        .then(reqs => ({ id: e.id, count: reqs.length }))
                        .catch(() => ({ id: e.id, count: 0 }))
                    )
                );
                const countMap = Object.fromEntries(counts.map(c => [c.id, c.count]));
                return events.map(e => ({ ...e, _requestCount: countMap[e.id] || 0 }));
            } catch {
                return events;
            }
        },
        get: (id) => request('GET', `/api/events/${id}`),
        create: (data) => request('POST', '/api/events', data, true),
        update: (id, data) => request('PUT', `/api/events/${id}`, data, true),
        delete: (id) => request('DELETE', `/api/events/${id}`, null, true),
        start: (id, zoomData) => request('POST', `/api/events/${id}/start`, zoomData, true),
        end: (id) => request('POST', `/api/events/${id}/end`, null, true),
    },

    // ── Join Requests ──────────────────────────────────────────
    requests: {
        send: (event_id, message) => request('POST', '/api/requests', { event_id, message }, true),
        myRequests: () => request('GET', '/api/requests/my', null, true),
        forEvent: (eventId) => request('GET', `/api/requests/event/${eventId}`, null, true),
        allForHost: () => request('GET', '/api/requests/all', null, true),
        participation: (eventId) => request('GET', `/api/requests/participation/${eventId}`, null, true),
        updateStatus: (requestId, status, ticket_type) =>
            request('PUT', `/api/requests/${requestId}`, { status, ticket_type }, true),
    },

    // ── Participants ────────────────────────────────────────────
    participants: {
        list: () => request('GET', '/api/participants'),
        create: (data) => request('POST', '/api/participants', data),
        update: (id, data) => request('PUT', `/api/participants/${id}`, data),
        delete: (id) => request('DELETE', `/api/participants/${id}`),
    },

    // ── Engagement ─────────────────────────────────────────────
    engagement: {
        list: () => request('GET', '/api/engagement'),
        log: (data) => request('POST', '/api/engagement', data),
    },

    // ── Marketing ──────────────────────────────────────────────
    marketing: {
        sendCampaign: (data) => request('POST', '/api/marketing/send', data),
        sendSingle: (data) => request('POST', '/api/marketing/single-send', data),
    },

    // ── Zoom ───────────────────────────────────────────────────
    zoom: {
        createMeeting: (data) => request('POST', '/api/zoom/create-meeting', data, true),
    },

    // ── Downloads ──────────────────────────────────────────────
    download: {
        participants: (eventId) => eventId ? `${BASE_URL}/api/download/requests?eventId=${eventId}` : `${BASE_URL}/api/download/requests`,
        leaderboard: (eventId) => eventId ? `${BASE_URL}/api/download/leaderboard?eventId=${eventId}` : `${BASE_URL}/api/download/leaderboard`,
        engagement: (eventId) => eventId ? `${BASE_URL}/api/download/engagement?eventId=${eventId}` : `${BASE_URL}/api/download/engagement`,
        events: () => `${BASE_URL}/api/download/events`,
        requests: (eventId) => eventId ? `${BASE_URL}/api/download/requests?eventId=${eventId}` : `${BASE_URL}/api/download/requests`,
        trigger: (url, filename) => {
            const token = getToken();
            fetch(url, { headers: token ? { Authorization: `Bearer ${token}` } : {} })
                .then(r => { if (!r.ok) throw new Error('No data available'); return r.blob(); })
                .then(blob => {
                    const a = document.createElement('a');
                    a.href = URL.createObjectURL(blob);
                    a.download = filename;
                    a.click();
                })
                .catch(err => alert(err.message));
        }
    },
};

// ── Backward compatibility shim ────────────────────────────────
export const base44 = {
    auth: {
        me: api.auth.me,
        login: (email, password) => api.auth.login(email, password),
        signup: api.auth.signup,
        logout: api.auth.logout,
        updateMe: api.auth.updateMe,
    },
    entities: {
        Event: {
            list: api.events.list,
            get: api.events.get,
            filter: async (params) => {
                const all = await api.events.list();
                if (params?.id) return all.filter(e => String(e.id) === String(params.id));
                return all;
            },
            create: api.events.create,
            update: api.events.update,
            delete: api.events.delete,
        },
        Registration: {
            list: api.participants.list,
            filter: async () => api.participants.list(),
            create: api.participants.create,
            update: (id, data) => api.participants.update(id, data),
            delete: api.participants.delete,
        },
    },
    integrations: {
        Core: {
            UploadFile: async ({ file }) => ({ file_url: URL.createObjectURL(file) }),
            InvokeLLM: async () => ({ result: 'AI features coming soon.' }),
        },
    },
};
