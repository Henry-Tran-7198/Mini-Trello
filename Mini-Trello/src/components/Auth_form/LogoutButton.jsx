// src/components/Auth_form/LogoutButton.jsx
import { useContext, useState } from 'react';
import { authService, removeToken } from '../../api/authService';
import { AuthContext } from '../../contexts/AuthContext';

export default function LogoutButton() {
    const { setUser } = useContext(AuthContext);
    const [loading, setLoading] = useState(false);

    const handleLogout = async () => {
        setLoading(true);
        try {
            await authService.logout();
        } catch (e) {
            // token hết hạn vẫn logout local
        } finally {
            removeToken();
            setUser(null);
            setLoading(false);
        }
    };

    return (
        <button onClick={handleLogout} disabled={loading}>
            {loading ? 'Logging out...' : 'Logout'}
        </button>
    );
}
