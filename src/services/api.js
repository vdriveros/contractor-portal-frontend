import axios from 'axios';

// Create axios instance
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add token to all requests
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Auth API calls
export const authAPI = {
    login: async (username, password) => {
        const formData = new URLSearchParams();
        formData.append('username', username);
        formData.append('password', password);

        const response = await api.post('/auth/login', formData, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        });
        return response.data;
    },

    register: async (userData) => {
        const response = await api.post('/auth/register', userData);
        return response.data;
    },

    getCurrentUser: async () => {
        const response = await api.get('/auth/me');
        return response.data;
    },
};

// Clients API
export const clientsAPI = {
    list: async () => {
        const response = await api.get('/clients');
        return response.data;
    },

    get: async (id) => {
        const response = await api.get(`/clients/${id}`);
        return response.data;
    },

    create: async (data) => {
        const response = await api.post('/clients', data);
        return response.data;
    },

    update: async (id, data) => {
        const response = await api.patch(`/clients/${id}`, data);
        return response.data;
    },

    delete: async (id) => {
        const response = await api.delete(`/clients/${id}`);
        return response.data;
    },
};

// Projects API
export const projectsAPI = {
    list: async (clientId = null) => {
        const params = clientId ? { client_id: clientId } : {};
        const response = await api.get('/projects', { params });
        return response.data;
    },

    get: async (id) => {
        const response = await api.get(`/projects/${id}`);
        return response.data;
    },

    create: async (data) => {
        const response = await api.post('/projects', data);
        return response.data;
    },

    update: async (id, data) => {
        const response = await api.patch(`/projects/${id}`, data);
        return response.data;
    },

    delete: async (id) => {
        const response = await api.delete(`/projects/${id}`);
        return response.data;
    },
};

// Files API
export const filesAPI = {
    upload: async (projectId, file, description = '') => {
        const formData = new FormData();
        formData.append('file', file);
        if (description) {
            formData.append('description', description);
        }

        const response = await api.post(`/files/${projectId}/upload`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    list: async (projectId) => {
        const response = await api.get(`/files/${projectId}/files`);
        return response.data;
    },

    delete: async (fileId) => {
        const response = await api.delete(`/files/${fileId}`);
        return response.data;
    },
};

export default api;