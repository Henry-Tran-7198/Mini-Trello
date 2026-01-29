// src/contexts/AuthContext.jsx   ← file này sửa thành như dưới

import { createContext, useState, useEffect } from 'react';
import { getToken, removeToken } from '../api/authService';
import { CircularProgress } from '@mui/material';

// Giả sử bạn đã có hàm này trong authService
import { authService } from '../api/authService';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);     // ← THÊM DÒNG NÀY

    // Load user từ token khi app mở (chạy 1 lần duy nhất)
    useEffect(() => {
        const token = getToken();
        if (token) {
            // Gọi API lấy thông tin user (phải có hàm này trong authService)
            authService.getCurrentUser() // ← hàm này bạn cần viết nếu chưa có
                .then((userData) => {
                    setUser(userData);
                })
                .catch((err) => {
                    console.error("Token invalid or expired", err);
                    removeToken();
                    setUser(null);
                })
                .finally(() => {
                    setLoading(false);            // ← quan trọng: báo đã load xong
                });
        } else {
            setLoading(false);                    // không có token → xong luôn
        }
    }, []);

    const logout = () => {
        removeToken();
        setUser(null);
    };

    // Nếu đang load user → hiển thị spinner (tránh flash màn hình login)
    if (loading) {
        return (
            <div style={{
                height: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                <CircularProgress />
            </div>
        );
    }

    return (
        <AuthContext.Provider value={{ user, setUser, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
}