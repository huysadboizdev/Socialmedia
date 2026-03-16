import React, { createContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import { loginUser, registerUser, getUserInfo, getMessages, setCachedToken } from '../service/userService';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isInitialized, setIsInitialized] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const [lastMessage, setLastMessage] = useState(null);
    const [unreadNotifCount, setUnreadNotifCount] = useState(0);

    const unreadIntervalRef = React.useRef(null);
    const notifiedMessageIdRef = React.useRef(null);

    const fetchUnreadCount = async () => {
        try {
            if (!user) return;
            
            if (user.role === 'admin') {
                // Admin logic: fetch conversations and sum unread counts + notifications
                const { getConversations, getNotifications } = require('../service/userService');
                const [convRes, notifRes] = await Promise.all([getConversations(), getNotifications(user._id)]);

                if (convRes.success && convRes.data) {
                    const conversations = convRes.data;
                    let totalUnread = 0;
                    let latestMsg = null;

                    for (const conv of conversations) {
                        totalUnread += conv.unreadCount || 0;
                        if (conv.lastMessage && conv.lastMessage.sender !== 'admin') {
                            if (!latestMsg || new Date(conv.lastMessage.createdAt) > new Date(latestMsg.createdAt)) {
                                latestMsg = { ...conv.lastMessage, username: conv.username, isChat: true };
                            }
                        }
                    }

                    // Check for new notifications (e.g. Orders)
                    let latestNotif = null;
                    if (notifRes.success && notifRes.notifications) {
                        const unreadNotifs = notifRes.notifications.filter(n => !n.isRead);
                        setUnreadNotifCount(unreadNotifs.length);
                        
                        if (unreadNotifs.length > 0) {
                            latestNotif = unreadNotifs[0]; // Assuming sorted by createdAt descending
                            
                            if (latestNotif.message?.includes('[ORDER]')) {
                                latestNotif.isOrder = true;
                            } else if (latestNotif.message?.includes('[DEPOSIT]')) {
                                latestNotif.isDeposit = true;
                            } else if (latestNotif.message?.includes('[REPORT]')) {
                                latestNotif.isReport = true;
                            } else {
                                latestNotif.isSystem = true;
                            }
                        }
                    }

                    // Determine the absolute latest event to show in the overlay
                    let absoluteLatest = null;
                    if (latestMsg && latestNotif) {
                        absoluteLatest = new Date(latestMsg.createdAt) > new Date(latestNotif.createdAt) ? latestMsg : latestNotif;
                    } else {
                        absoluteLatest = latestMsg || latestNotif;
                    }

                    if (absoluteLatest && absoluteLatest._id !== notifiedMessageIdRef.current) {
                        notifiedMessageIdRef.current = absoluteLatest._id;
                        setLastMessage(absoluteLatest);
                    }

                    setUnreadCount(totalUnread);
                }
            } else {
                // Regular user logic
                const res = await getMessages(user._id);
            
                if (res.success && res.data) {
                    const messages = res.data;
                    const unread = messages.filter(m => m.sender === 'admin' && !m.isRead).length;
                    
                    const latestAdminMsg = [...messages].reverse().find(m => m.sender === 'admin');
                    if (latestAdminMsg && latestAdminMsg._id !== notifiedMessageIdRef.current) {
                        notifiedMessageIdRef.current = latestAdminMsg._id;
                        setLastMessage(latestAdminMsg);
                    }
                    
                    setUnreadCount(unread);
                }
            }
        } catch (error) {
            console.log('Error fetching unread count', error);
        }
    };

    useEffect(() => {
        checkLoginStatus();
    }, []);

    useEffect(() => {
        if (user) {
            // Poll for unread messages every 3 seconds when logged in (both roles)
            unreadIntervalRef.current = setInterval(fetchUnreadCount, 3000);
            fetchUnreadCount();
        } else {
            clearInterval(unreadIntervalRef.current);
            setUnreadCount(0);
        }
        return () => clearInterval(unreadIntervalRef.current);
    }, [user]);

    const checkLoginStatus = async () => {
        try {
            const token = await SecureStore.getItemAsync('token');
            const storedUser = await SecureStore.getItemAsync('user');
            
            if (token) {
                setCachedToken(token); // Add token to memory
                
                // If we have a stored user, use it first (especially for admin)
                if (storedUser) {
                    const parsedUser = JSON.parse(storedUser);
                    setUser(parsedUser);
                    
                    // If it's admin, DO NOT call getUserInfo to avoid 500 error
                    if (parsedUser.role === 'admin') {
                        setIsInitialized(true);
                        return;
                    }
                }

                // For normal users, refresh info
                try {
                    const res = await getUserInfo();
                    if (res.success) {
                        setUser(res.user);
                        // Update stored user
                        await SecureStore.setItemAsync('user', JSON.stringify(res.user));
                    }
                } catch (_e) {
                    console.log('Token valid but getUserInfo failed, using stored user if available');
                }
            }
        } catch (_error) {
            console.log('Not logged in or token expired');
            setCachedToken(null);
            await SecureStore.deleteItemAsync('token');
            await SecureStore.deleteItemAsync('user');
        } finally {
            setIsInitialized(true);
        }
    };

    const login = async (email, password) => {
        setIsLoading(true);
        try {
            const data = await loginUser(email, password);
            if (data.success) {
                await SecureStore.setItemAsync('token', data.token);
                setCachedToken(data.token);
                
                // IMPORTANT: Save user data immediately
                if (data.user) {
                    await SecureStore.setItemAsync('user', JSON.stringify(data.user));
                    setUser(data.user);
                }

                // If Admin, skip getUserInfo check to prevent crash
                if (data.user?.role === 'admin') {
                     return { success: true };
                }

                // Fetch full user info immediately for normal users
                try {
                    const res = await getUserInfo();
                    if (res.success) {
                        setUser(res.user);
                        await SecureStore.setItemAsync('user', JSON.stringify(res.user));
                    }
                } catch(e) {
                     console.log('Error fetching user info details', e);
                }
                return { success: true };
            } else {
                // Client-side Admin Fallback (Requested by User)
                // Since backend env vars might not be loaded yet, we handle admin locally to allow UI access
                const ADMIN_EMAIL = process.env.EXPO_PUBLIC_ADMIN_EMAIL || 'admin@gmail.com';
                const ADMIN_PASS = process.env.EXPO_PUBLIC_ADMIN_PASSWORD || 'admin123';

                if (email === ADMIN_EMAIL && password === ADMIN_PASS) {
                    console.log('Client-side Admin Login Bypass Active');
                    const adminUser = {
                        _id: 'admin',
                        username: 'Administrator',
                        email: ADMIN_EMAIL,
                        role: 'admin',
                        balance: 999999999
                    };
                    const fakeToken = 'admin-bypass-token-client-side'; // Note: API calls will likely fail without real token
                    
                    await SecureStore.setItemAsync('token', fakeToken);
                    setCachedToken(fakeToken);
                    await SecureStore.setItemAsync('user', JSON.stringify(adminUser));
                    setUser(adminUser);
                    return { success: true };
                }

                return { success: false, message: data.message };
            }
        } catch (error) {
            const msg = error.message || (typeof error === 'string' ? error : 'Login failed');
            return { success: false, message: msg };
        } finally {
            setIsLoading(false);
        }
    };

    const register = async (userData) => {
        setIsLoading(true);
        try {
            const data = await registerUser(userData);
            if (data.success) {
                return { success: true, message: data.message };
            } else {
                return { success: false, message: data.message };
            }
        } catch (error) {
            return { success: false, message: error.message || 'Registration failed' };
        } finally {
            setIsLoading(false);
        }
    };

    const logout = async () => {
        setIsLoading(true);
        try {
            setCachedToken(null);
            await SecureStore.deleteItemAsync('token');
            await SecureStore.deleteItemAsync('user');
            setUser(null);
            setUnreadCount(0);
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const setToken = async (token) => {
        try {
            await SecureStore.setItemAsync('token', token);
            setCachedToken(token);
            // Try to get user info, if fails/admin issue, assume no user? 
            // setToken is rarely used manually, mostly for dev.
            const res = await getUserInfo();
            if (res.success) {
                setUser(res.user);
                await SecureStore.setItemAsync('user', JSON.stringify(res.user));
            }
            return true;
        } catch (error) {
            console.log('Error setting token:', error);
            return false;
        }
    };

    return (
        <AuthContext.Provider value={{ user, isLoading, login, register, logout, isInitialized, setToken, unreadCount, unreadNotifCount, refreshUnreadCount: fetchUnreadCount, lastMessage, setLastMessage, refreshUser: checkLoginStatus }}>
            {children}
        </AuthContext.Provider>
    );
};
