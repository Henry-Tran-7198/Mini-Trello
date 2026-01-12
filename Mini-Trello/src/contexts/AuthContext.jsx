import { createContext, useState, useEffect } from 'react';
import { getUser, saveUser, removeUser } from '../utils/storage';
import { setToken, removeToken } from '../api/authService';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(getUser());

    const loginUser = (userData, token) => {
        setUser(userData);
        saveUser(userData);
        setToken(token);
    };

    const logoutUser = async (apiLogout) => {
        try {
            await apiLogout();
        } catch (err) {
            console.error(err);
        }
        setUser(null);
        removeUser();
        removeToken();
    };

    return (
        <AuthContext.Provider value={{ user, loginUser, logoutUser }}>
            {children}
        </AuthContext.Provider>
    );
};
