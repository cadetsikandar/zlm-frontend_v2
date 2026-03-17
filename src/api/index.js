import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL || '';

const api = axios.create({
  baseURL: API_BASE,
  timeout: 120000, // 2min for AI generation calls
});

// Auto-attach JWT token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('zlm_access_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
}, (error) => Promise.reject(error));

// Handle 401 globally
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      const code = err.response?.data?.error;
      if (code === 'UNAUTHORIZED' || code === 'TOKEN_EXPIRED') {
        localStorage.removeItem('zlm_access_token');
        localStorage.removeItem('zlm_refresh_token');
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(err);
  }
);

// ─── AUTH ──────────────────────────────────────────────────────
export const login = (email, password) =>
  api.post('/api/auth/login', { email, password });

export const register = (data) =>
  api.post('/api/auth/register', data);

export const getMe = () =>
  api.get('/api/auth/me');

export const refreshToken = (token) =>
  api.post('/api/auth/refresh', { refreshToken: token });

// ─── DASHBOARD ────────────────────────────────────────────────
export const getDashboardStats = () =>
  api.get('/api/dashboard/stats');

// ─── BOOKS ────────────────────────────────────────────────────
export const getBooks = (params) => api.get('/api/books', { params });
export const getBook  = (id) => api.get(`/api/books/${id}`);
export const createBook = (data) => api.post('/api/books', data);
export const updateBook = (id, data) => api.put(`/api/books/${id}`, data);
export const deleteBook = (id) => api.delete(`/api/books/${id}`);

export const generateToc = (id, data) =>
  api.post(`/api/books/${id}/generate-toc`, data);

export const generateTerminology = (id) =>
  api.post(`/api/books/${id}/generate-terminology`);

export const getBookChapters = (id) =>
  api.get(`/api/books/${id}/chapters`);

// ─── CHAPTERS ─────────────────────────────────────────────────
export const getChapters = (bookId) =>
  api.get('/api/chapters', { params: { bookId } });

export const getChapter = (id) =>
  api.get(`/api/chapters/${id}`);

export const generateChapter = (id, data) =>
  api.post(`/api/chapters/${id}/generate`, data);

export const runChapterQA = (id, data) =>
  api.post(`/api/chapters/${id}/qa`, data);

export const getChapterQaReport = (id) =>
  api.get(`/api/chapters/${id}/qa-report`);

export const downloadChapter = (id) =>
  api.get(`/api/chapters/${id}/download`, { responseType: 'blob' });

export const addChapter = (bookId, data) =>
  api.post(`/api/books/${bookId}/chapters`, data);

export const deleteChapter = (id) =>
  api.delete(`/api/chapters/${id}`);

export const clearChapter = (id) =>
  api.post(`/api/chapters/${id}/clear`);

// ─── QA REPORTS ───────────────────────────────────────────────
export const getAllQAReports = (params) =>
  api.get('/api/qa/reports', { params });

// ─── PROMPTS ──────────────────────────────────────────────────
export const getPrompts = () => api.get('/api/prompts/active');
export const getAllPrompts = () => api.get('/api/prompts');
export const updatePrompt = (id, data) => api.put(`/api/prompts/${id}`, data);
export const createPrompt = (data) => api.post('/api/prompts', data);

// ─── USERS ────────────────────────────────────────────────────
export const getUsers = () => api.get('/api/users');
export const createUser = (data) => api.post('/api/users', data);
export const updateUser = (id, data) => api.put(`/api/users/${id}`, data);
export const deleteUser = (id) => api.delete(`/api/users/${id}`);

// ─── JOBS ─────────────────────────────────────────────────────
export const getJobStatus = (jobId) => api.get(`/api/jobs/${jobId}`);

export default api;
