// src/components/Auth_form/LoginForm.jsx
import { useState, useContext } from 'react';
import { authService, setToken } from '../../api/authService';
import { AuthContext } from '../../contexts/AuthContext';

export default function LoginForm() {
    const { setUser } = useContext(AuthContext);

    const [form, setForm] = useState({ login: '', password: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = e => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async e => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await authService.login(form);
            setToken(res.data.token);
            setUser(res.data.user); // Cập nhật user vào context
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="login-form">
            <h2>Login</h2>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <input
                type="text"
                name="login"
                placeholder="Email or Username"
                value={form.login}
                onChange={handleChange}
                required
            />
            <input
                type="password"
                name="password"
                placeholder="Password"
                value={form.password}
                onChange={handleChange}
                required
            />
            <button type="submit" disabled={loading}>
                {loading ? 'Logging in...' : 'Login'}
            </button>
        </form>
    );
}
