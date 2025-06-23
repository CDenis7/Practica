import axios from 'axios';
import { getToken } from './authService';

const apiClient = axios.create({
    baseURL: '/api',
    headers: {
        'Content-Type': 'application/json'
    }
});


apiClient.interceptors.request.use(
    (config) => {
        const token = getToken();
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

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

export async function uploadPhoto(projectId, base64Image) {
    const payload = { image: base64Image };
    return apiClient.post(`/projects/${projectId}/photos`, payload);
}
export async function deletePhoto(photoId) {
    return apiClient.delete(`/projects/photos/${photoId}`);
}

export async function getAuthors() {
    return apiClient.get('/authors');
}
export async function createAuthor(authorData) {
    return apiClient.post('/authors', authorData);
}