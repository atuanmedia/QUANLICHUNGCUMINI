// frontend/src/context/AuthContext.jsx
import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL; // ✅ thay process.env

    useEffect(() => {
        const loadUserFromLocalStorage = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    // Gọi API profile với token
                    const { data } = await axios.get(`${API_BASE_URL}/api/auth/profile`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    setUser(data);
                } catch (error) {
                    console.error("Failed to load user from token:", error);
                    localStorage.removeItem('token');
                }
            }
            setLoading(false);
        };
        loadUserFromLocalStorage();
    }, [API_BASE_URL]);

    const login = async (email, password) => {
        try {
            const { data } = await axios.post(
                `${API_BASE_URL}/api/auth/login`,
                { email, password },
                { headers: { 'Content-Type': 'application/json' } }
            );

            localStorage.setItem('token', data.token);
            setUser(data);

            if (data.role === 'admin') navigate('/admin/dashboard');
            else if (data.role === 'resident') navigate('/resident/dashboard');
            else navigate('/');

            return data;
        } catch (error) {
            console.error("Login failed:", error.response?.data?.message || error.message);
            throw error;
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
        navigate('/login');
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
