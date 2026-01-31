import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const API_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

// Debugging: Check actual URL being used
console.log('Current API_URL:', API_URL);

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true',
        'Bypass-Tunnel-Reminder': 'true',
    },
    timeout: 10000,
});

// Add a request interceptor to add the token to requests
api.interceptors.request.use(
    async (config) => {
        const token = await SecureStore.getItemAsync('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export const loginUser = async (email, password) => {
    try {
        const response = await api.post('/user/login', { email, password });
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const registerUser = async (userData) => {
    try {
        const response = await api.post('/user/register', {
            username: userData.username,
            email: userData.email,
            password_1: userData.password,
            password_2: userData.confirmPassword
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const getUserInfo = async () => {
    try {
        const response = await api.get('/user/me');
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export default api;
