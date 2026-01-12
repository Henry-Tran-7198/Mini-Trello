import { useState } from 'react';
import { authService } from '../../api/authService';

export default function RegisterForm({ onSuccess }) {
    const [form, setForm] = useState({
        name: '',
        email: '',
        password: '',
        password_confirmation: ''
    });
    const [avatar, setAvatar] = useState(null);
    const [error, setError] = useState('');

    const handleChange = e => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async e => {
        e.preventDefault();
        setError('');

        try {
            const formData = new FormData();
            Object.entries(form).forEach(([key, value]) => {
                formData.append(key, value);
            });

            if (avatar) {
                formData.append('avatar', avatar);
            }

            await authService.register(formData);
            onSuccess?.(); // quay về Login
        } catch (err) {
            setError(err.response?.data?.message || 'Register failed');
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <h2>Register</h2>

            {error && <p style={{ color: 'red' }}>{error}</p>}

            <input name="name" placeholder="UserName" onChange={handleChange} required />
            <input name="email" placeholder="Email" onChange={handleChange} required />
            <input type="password" name="password" placeholder="Password" onChange={handleChange} required />
            <input
                type="password"
                name="password_confirmation"
                placeholder="Confirm Password"
                onChange={handleChange}
                required
            />

            <input
                type="file"
                accept="image/*"
                onChange={e => setAvatar(e.target.files[0])}
            />

            <button type="submit">Register</button>
        </form>
    );
}
