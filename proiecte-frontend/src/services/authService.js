import axios from 'axios';

// This Axios client connects directly to the backend for authentication.
// It does NOT use the /api proxy.
const authApiClient = axios.create({
    baseURL: 'http://localhost:8080' 
});

const TOKEN_KEY = 'jwt-token';

/**
 * Logs in the user and stores the token.
 * @param {string} username 
 * @param {string} password 
 * @returns {Promise<boolean>} - True if login is successful, otherwise throws an error.
 */
export const login = async (username, password) => {
    try {
        const response = await authApiClient.post('/auth/login', { username, password });
        const token = response.data.token;
        if (token) {
            localStorage.setItem(TOKEN_KEY, token);
            return true;
        }
        return false;
    } catch (error) {
        console.error('Login failed:', error);
        throw error; // Rethrow to be caught in the component
    }
};

/**
 * Removes the token from storage.
 */
export const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
};

/**
 * Retrieves the stored token.
 * @returns {string|null}
 */
export const getToken = () => {
    return localStorage.getItem(TOKEN_KEY);
};

/**
 * Checks if a user is currently logged in.
 * @returns {boolean}
 */
export const isLoggedIn = () => {
    return !!getToken();
};