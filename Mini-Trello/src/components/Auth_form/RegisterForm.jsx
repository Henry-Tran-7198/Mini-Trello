// src/components/Auth_form/RegisterForm.jsx
import { useState } from 'react';
import { authService } from '../../api/authService';
import { useContext } from 'react';
import { AuthContext } from '../../contexts/AuthContext';

export default function RegisterForm() {
    const { setUser } = useContext(AuthContext);

    const [form, setForm] = useState({
        username: '',
        email: '',
        password: '',
        password_confirmation: ''
    });

    const [avatarFile, setAvatarFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = e => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleAvatar = e => {
        setAvatarFile(e.target.files[0]);
    };

    const handleSubmit = async e => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const formData = new FormData();
            formData.append('username', form.username);
            formData.append('email', form.email);
            formData.append('password', form.password);
            formData.append('password_confirmation', form.password_confirmation);
            if (avatarFile) formData.append('avatar', avatarFile);

            const res = await authService.register(formData);

            alert(res.data.message); // "Register success"
            setForm({
                username: '',
                email: '',
                password: '',
                password_confirmation: ''
            });
            setAvatarFile(null);
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="register-form">
            <h2>Register</h2>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <input
                type="text"
                name="username"
                placeholder="Username"
                value={form.username}
                onChange={handleChange}
                required
            />
            <input
                type="email"
                name="email"
                placeholder="Email"
                value={form.email}
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
            <input
                type="password"
                name="password_confirmation"
                placeholder="Confirm Password"
                value={form.password_confirmation}
                onChange={handleChange}
                required
            />
            <input
                type="file"
                accept="image/*"
                onChange={handleAvatar}
            />
            <button type="submit" disabled={loading}>
                {loading ? 'Registering...' : 'Register'}
            </button>
        </form>
    );
}
