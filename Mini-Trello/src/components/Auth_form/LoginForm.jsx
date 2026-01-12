// src/components/Auth_form/LoginForm.jsx
import { useState, useContext } from 'react';
import { authService, setToken } from '../../api/authService';
import { AuthContext } from '../../contexts/AuthContext';

export default function LoginForm() {
    const { setUser } = useContext(AuthContext);

    const [form, setForm] = useState({ login: '', password: '' });
    const [error, setError] = useState('');

    const handleSubmit = async e => {
        e.preventDefault();
        try {
            const res = await authService.login(form);
            setToken(res.data.token);
            setUser(res.data.user);
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed');
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <h2>Login</h2>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <input
                name="login"
                placeholder="Email hoặc Username"
                onChange={e => setForm({ ...form, login: e.target.value })}
                required
            />
            <input
                type="password"
                placeholder="Password"
                onChange={e => setForm({ ...form, password: e.target.value })}
                required
            />
            <button>Login</button>
        </form>
    );
}
