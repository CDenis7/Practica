import axios from 'axios';
import { getToken } from './authService';

// This client uses the /api proxy configured in vite.config.js
const apiClient = axios.create({
    baseURL: '/api',
    headers: {
        'Content-Type': 'application/json'
    }
});

// Axios interceptor: This function runs before each request is sent.
apiClient.interceptors.request.use(
    (config) => {
        const token = getToken(); // Get the token from localStorage
        if (token) {
            // If the token exists, add it to the Authorization header
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        // Do something with request error
        return Promise.reject(error);
    }
);

// --- Project Functions ---
export async function getProjects() {
    return apiClient.get('/projects');
}
export async function getProjectById(projectId) {
    return apiClient.get(`/projects/${projectId}`);
}
export async function createProject(projectData) {
    return apiClient.post('/projects', projectData);
}
export async function updateProject(projectId, projectData) {
    return apiClient.put(`/projects/${projectId}`, projectData);
}
export async function deleteProject(projectId) {
    return apiClient.delete(`/projects/${projectId}`);
}

// --- Photo Functions ---
export async function uploadPhoto(projectId, base64Image) {
    const payload = { image: base64Image };
    return apiClient.post(`/projects/${projectId}/photos`, payload);
}
export async function deletePhoto(photoId) {
    return apiClient.delete(`/projects/photos/${photoId}`);
}

// --- Author Functions ---
export async function getAuthors() {
    return apiClient.get('/authors');
}
export async function createAuthor(authorData) {
    return apiClient.post('/authors', authorData);
}