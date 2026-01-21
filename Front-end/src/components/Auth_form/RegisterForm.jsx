import { useState } from 'react';
import { authService } from '../../api/authService';

// MUI Components
import {
    Box,
    Button,
    TextField,
    Typography,
    Container,
    Avatar,
    InputAdornment,
    IconButton,
    Alert,
    Paper
} from '@mui/material';
import { PhotoCamera } from '@mui/icons-material';

export default function RegisterForm({ onSuccess }) {
    const [form, setForm] = useState({
        username: '',
        email: '',
        password: '',
        password_confirmation: ''
    });
    const [avatar, setAvatar] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState(null); // Để xem trước ảnh
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setAvatar(file);
            setAvatarPreview(URL.createObjectURL(file)); // Xem trước ảnh
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const formData = new FormData();
            Object.entries(form).forEach(([key, value]) => {
                formData.append(key, value);
            });
            if (avatar) {
                formData.append('avatar', avatar);
            }

            await authService.register(formData);
            onSuccess?.(); // Quay về trang login khi thành công
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed. Please try again!');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container maxWidth="sm">
            <Paper elevation={8} sx={{ mt: 8, p: 4, borderRadius: 3 }}>
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                    }}
                >
                    {/* Tiêu đề */}
                    <Typography component="h1" variant="h4" fontWeight="bold" color="primary">
                        Register
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1, mb: 3 }}>
                        Create a new account to get started
                    </Typography>

                    {/* Avatar preview */}
                    <Box sx={{ position: 'relative', mb: 3 }}>
                        <Avatar
                            src={avatarPreview}
                            sx={{ width: 100, height: 100, border: '4px solid #fff', boxShadow: 3 }}
                        />
                        <input
                            accept="image/*"
                            type="file"
                            id="avatar-upload"
                            hidden
                            onChange={handleAvatarChange}
                        />
                        <label htmlFor="avatar-upload">
                            <IconButton
                                color="primary"
                                component="span"
                                sx={{
                                    position: 'absolute',
                                    bottom: 0,
                                    right: 0,
                                    bgcolor: 'background.paper',
                                    '&:hover': { bgcolor: 'grey.200' }
                                }}
                            >
                                <PhotoCamera />
                            </IconButton>
                        </label>
                    </Box>

                    {/* Form */}
                    <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
                        {error && (
                            <Alert severity="error" sx={{ mb: 3 }}>
                                {error}
                            </Alert>
                        )}

                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            label="Username"
                            name="username"
                            value={form.username}
                            onChange={handleChange}
                            autoComplete="username"
                            autoFocus
                        />

                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            label="Email"
                            name="email"
                            type="email"
                            value={form.email}
                            onChange={handleChange}
                            autoComplete="email"
                        />

                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            label="Password"
                            name="password"
                            type="password"
                            value={form.password}
                            onChange={handleChange}
                            autoComplete="new-password"
                        />

                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            label="Password-Confirmation"
                            name="password_confirmation"
                            type="password"
                            value={form.password_confirmation}
                            onChange={handleChange}
                            autoComplete="new-password"
                        />

                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            size="large"
                            disabled={loading}
                            sx={{ mt: 4, mb: 2, py: 1.5, fontSize: '1.1rem' }}
                        >
                            {loading ? 'Registering...' : 'Register'}
                        </Button>


                    </Box>
                </Box>
            </Paper>
        </Container>
    );
}