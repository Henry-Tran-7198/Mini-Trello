// src/components/Auth_form/LogoutButton.jsx
import { useContext } from 'react';
import { authService, removeToken } from '../../api/authService';
import { AuthContext } from '../../contexts/AuthContext';

export default function LogoutButton() {
    const { setUser } = useContext(AuthContext);

    const handleLogout = async () => {
        try {
            await authService.logout();
        } catch (err) {
            console.warn(err.response?.data?.message || 'Logout failed');
        } finally {
            removeToken();
            setUser(null);
        }
    };

    return <button onClick={handleLogout}>Logout</button>;
}
