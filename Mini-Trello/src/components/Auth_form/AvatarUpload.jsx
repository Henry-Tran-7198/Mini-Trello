// src/components/Auth_form/AvatarUpload.jsx
import { useState, useContext } from 'react';
import { authService } from '../../api/authService';
import { AuthContext } from '../../contexts/AuthContext';

export default function AvatarUpload() {
    const { user, setUser } = useContext(AuthContext);
    const [avatarFile, setAvatarFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    const handleFileChange = e => setAvatarFile(e.target.files[0]);

    const handleUpload = async e => {
        e.preventDefault();
        if (!avatarFile) return;

        setLoading(true);
        setMessage('');

        const formData = new FormData();
        formData.append('avatar', avatarFile);

        try {
            const res = await authService.uploadAvatar(formData);
            setUser({ ...user, avatar: res.data.avatar_url });
            setMessage(res.data.message);
            setAvatarFile(null);
        } catch (err) {
            setMessage(err.response?.data?.message || 'Upload failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleUpload}>
            <h3>Update Avatar</h3>
            {message && <p>{message}</p>}
            <input type="file" accept="image/*" onChange={handleFileChange} />
            <button type="submit" disabled={loading}>
                {loading ? 'Uploading...' : 'Upload'}
            </button>
            {user?.avatar && <img src={user.avatar} alt="Avatar" width={100} />}
        </form>
    );
}
