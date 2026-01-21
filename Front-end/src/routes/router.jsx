// src/router.jsx  (or wherever you keep your routes)
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../Contexts/AuthContext';

import AuthPage from '../pages/AuthPage';
import Board from '../pages/Boards/_id';

// 1. Route bảo vệ: chỉ cho vào nếu ĐÃ login (có user)
function ProtectedRoute({ children }) {
    const { user } = useContext(AuthContext);
    if (!user) return <Navigate to="/" replace />;
    return children;
}

// 2. Route công khai: chỉ cho vào nếu CHƯA login (không có user)
function PublicOnlyRoute({ children }) {
    const { user } = useContext(AuthContext);
    if (user) return <Navigate to="/board" replace />;
    return children;
}

const router = createBrowserRouter([
    {
        path: "/",
        element: (
            <PublicOnlyRoute>
                <AuthPage />
            </PublicOnlyRoute>
        ),
    },
    {
        path: "/board",
        element: (
            <ProtectedRoute>
                <Board />
            </ProtectedRoute>
        ),
    },
    {
        path: "/board/:boardId",
        element: (
            <ProtectedRoute>
                <Board />
            </ProtectedRoute>
        ),
    },
    // Bất kỳ đường dẫn lạ nào → về trang login
    {
        path: "*",
        element: <Navigate to="/" replace />,
    },
]);

export default router;