import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const API_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

let cachedToken = null;

export const setCachedToken = (token) => {
    cachedToken = token;
};

// Debugging: Check actual URL being used
console.log('Current API_URL:', API_URL);

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true',
        'Bypass-Tunnel-Reminder': 'true',
    },
    timeout: 30000,
});

// Add a request interceptor to add the token to requests
api.interceptors.request.use(
    async (config) => {
        let token = cachedToken;
        if (!token) {
            try {
                token = await SecureStore.getItemAsync('token');
                if (token) cachedToken = token;
            } catch (e) {
                console.log('SecureStore read error in background:', e);
            }
        }

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

export const getMessages = async (userId) => {
    try {
        const response = await api.get(`/message/list?userId=${userId}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const markMessagesAsRead = async (userId) => {
    try {
        const response = await api.post('/message/read', { userId, sender: 'user' });
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const sendMessage = async (messageData) => {
    try {
        const response = await api.post('/message/send', messageData);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

// --- ADMIN CHAT APIS ---

export const getConversations = async () => {
    try {
        const response = await api.get('/message/conversations');
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const markAdminMessagesAsRead = async (userId) => {
    try {
        const response = await api.post('/message/read', { userId, sender: 'admin' });
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const sendAdminMessage = async (messageData) => {
    try {
        // messageData should contain { userId, content, replyTo }
        const response = await api.post('/message/send', { ...messageData, sender: 'admin' });
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const getNotifications = async (userId) => {
    try {
        const response = await api.post('/user/service', {
            action: 'getNotifications',
            userId
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const markNotificationRead = async (userId, notificationId) => {
    try {
        const response = await api.post('/user/service', {
            action: 'markNotificationRead',
            userId,
            details: { notificationId }
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const getLeaderboard = async (userId = '') => {
    try {
        const url = userId ? `/user/leaderboard?userId=${userId}` : '/user/leaderboard';
        const response = await api.get(url);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

// --- 2FA APIS ---
export const generate2FA = async (method) => {
    try {
        const response = await api.post('/auth2fa/generate', { method });
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const verifySetup2FA = async (code) => {
    try {
        const response = await api.post('/auth2fa/verify-setup', { code });
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const disable2FA = async (code = null) => {
    try {
        const response = await api.post('/auth2fa/disable', { code });
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export default api;
