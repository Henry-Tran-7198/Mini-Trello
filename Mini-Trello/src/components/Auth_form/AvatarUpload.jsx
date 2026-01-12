// src/components/Auth_form/AvatarUpload.jsx
import { useState, useContext } from 'react';
import { authService } from '../../api/authService';
import { AuthContext } from '../../contexts/AuthContext';

export default function AvatarUpload() {
    const { setUser } = useContext(AuthContext);
    const [file, setFile] = useState(null);

    const submit = async e => {
        e.preventDefault();
        if (!file) return;

        const formData = new FormData();
        formData.append('avatar', file);

        const res = await authService.uploadAvatar(formData);
        setUser(prev => ({ ...prev, avatar: res.data.avatar_url }));
    };

    return (
        <form onSubmit={submit}>
            <input type="file" onChange={e => setFile(e.target.files[0])} />
            <button type="submit">Update avatar</button>
        </form>
    );
}
