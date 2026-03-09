import { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';

const useAdminChat = () => {
    const [unreadCount, setUnreadCount] = useState(0);
    const API_URL = import.meta.env.VITE_BACKEND_URL;
    const token = localStorage.getItem('token');
    const intervalRef = useRef(null);

    const fetchUnreadCount = useCallback(async () => {
        if (!token) return;
        try {
            const res = await axios.get(`${API_URL}/api/message/conversations`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.data.success) {
                // Sum up unread counts from all conversations
                const totalUnread = res.data.data.reduce((acc, curr) => acc + (curr.unreadCount || 0), 0);
                setUnreadCount(totalUnread);
            }
        } catch (error) {
            console.error("Error fetching unread chat count:", error);
        }
    }, [API_URL, token]);

    useEffect(() => {
        setTimeout(() => fetchUnreadCount(), 0);
        intervalRef.current = setInterval(fetchUnreadCount, 10000); // Poll every 10 seconds

        return () => clearInterval(intervalRef.current);
    }, [fetchUnreadCount]);

    return { unreadCount, refresh: fetchUnreadCount };
};

export default useAdminChat;
