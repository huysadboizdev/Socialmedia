
import React, { createContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import { loginUser, registerUser, getUserInfo } from '../service/userService';
import { useRouter, useSegments } from 'expo-router';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isInitialized, setIsInitialized] = useState(false);
    const router = useRouter();
    const segments = useSegments();

    useEffect(() => {
        checkLoginStatus();
    }, []);

    useEffect(() => {
        if (!isInitialized) return;

        const inAuthGroup = segments[0] === '(auth)';
        
        if (user && inAuthGroup) {
            router.replace('/(tab)/home');
        } else if (!user && !inAuthGroup) {
            router.replace('/(auth)/login');
        }
    }, [user, segments, isInitialized]);

    const checkLoginStatus = async () => {
        try {
            const token = await SecureStore.getItemAsync('token');
            if (token) {
                const res = await getUserInfo();
                if (res.success) {
                    setUser(res.user);
                }
            }
        } catch (error) {
            console.log('Not logged in or token expired');
            await SecureStore.deleteItemAsync('token');
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
                // Fetch full user info immediately
                try {
                    const res = await getUserInfo();
                    if (res.success) {
                        setUser(res.user);
                    }
                } catch(e) {
                     // If fetch fails but login success, just set basic info or retry
                     // Ideally backend returns user info on login too
                     console.log('Error fetching user info details', e);
                }
                return { success: true };
            } else {
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
            await SecureStore.deleteItemAsync('token');
            setUser(null);
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const setToken = async (token) => {
        try {
            await SecureStore.setItemAsync('token', token);
            const res = await getUserInfo();
            if (res.success) {
                setUser(res.user);
            }
            return true;
        } catch (error) {
            console.log('Error setting token:', error);
            return false;
        }
    };

    return (
        <AuthContext.Provider value={{ user, isLoading, login, register, logout, isInitialized, setToken }}>
            {children}
        </AuthContext.Provider>
    );
};
