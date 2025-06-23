import axios from 'axios';
import { ref } from 'vue';

const authApiClient = axios.create({
    baseURL: 'http://localhost:8080' 
});

const TOKEN_KEY = 'jwt-token';
export const isLoggedInState = ref(!!localStorage.getItem(TOKEN_KEY));
export const login = async (username, password) => {
    try {
        const response = await authApiClient.post('/auth/login', { username, password });
        const token = response.data.token;
        if (token) {
            localStorage.setItem(TOKEN_KEY, token);
            isLoggedInState.value = true;
            return true;
        }
        return false;
    } catch (error) {
        console.error('Login failed:', error);
        throw error;
    }
};


export const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    isLoggedInState.value = false;
};

export const getToken = () => {
    return localStorage.getItem(TOKEN_KEY);
};
export const isLoggedIn = () => {
    return !!getToken();
};