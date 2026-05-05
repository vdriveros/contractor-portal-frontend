import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { authAPI } from '../services/api';
import Toast from '../components/common/Toast';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState(null);
    const navigate = useNavigate();

    // Show toast helper
    const showToast = (message, type = 'success') => {
        setToast({ message, type });
    };

    // Check if user is logged in on mount
    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    const userData = await authAPI.getCurrentUser();
                    setUser(userData);
                } catch (error) {
                    localStorage.removeItem('token');
                }
            }
            setLoading(false);
        };
        checkAuth();
    }, []);

    const login = async (username, password) => {
        try {
            const data = await authAPI.login(username, password);
            localStorage.setItem('token', data.access_token);
            const userData = await authAPI.getCurrentUser();
            setUser(userData);
            return { success: true, user: userData };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.detail || 'Login failed',
            };
        }
    };

    const logout = (isExpired = false) => {
        localStorage.removeItem('token');
        setUser(null);
        if (isExpired) {
            showToast('Su sesión ha vencido. Por favor, inicie sesión nuevamente.', 'error');
        }
        navigate('/login');
    };

    // Axios interceptor for 401 errors
    useEffect(() => {
        const interceptor = api.interceptors.response.use(
            (response) => response,
            (error) => {
                if (error.response?.status === 401) {
                    // Don't toast if we're on the login page or it's a login attempt
                    const isLoginPage = window.location.pathname === '/login';
                    const isLoginRequest = error.config.url.includes('/auth/login');

                    if (!isLoginPage && !isLoginRequest) {
                        logout(true);
                    }
                }
                return Promise.reject(error);
            }
        );

        return () => {
            api.interceptors.response.eject(interceptor);
        };
    }, []);

    return (
        <AuthContext.Provider value={{ user, loading, login, logout, showToast }}>
            {children}
            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};