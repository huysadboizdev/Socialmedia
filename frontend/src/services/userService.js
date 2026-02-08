import axios from "axios";

const API_URL = import.meta.env.VITE_BACKEND_URL;

const userService = {
    getNotifications: async () => {
        const token = localStorage.getItem("token");
        const response = await axios.post(
            `${API_URL}/api/user/service`,
            { action: 'getNotifications' },
            { headers: { Authorization: `Bearer ${token}` } }
        );
        return response.data;
    },

    markNotificationRead: async (notificationId) => {
        const token = localStorage.getItem("token");
        const response = await axios.post(
             `${API_URL}/api/user/service`,
            { 
                action: 'markNotificationRead',
                details: { notificationId }
            },
            { headers: { Authorization: `Bearer ${token}` } }
        );
        return response.data;
    }
};

export default userService;
