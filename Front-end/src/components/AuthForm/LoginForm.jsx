// src/components/Auth_form/LoginForm.jsx
import { useState, useContext } from 'react';
import { authService, setToken } from '../../api/authService';
import { AuthContext } from '../../Contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
// MUI Components
import {
    Box,
    Button,
    TextField,
    Typography,
    Container,
    Alert,
    Paper,
    CircularProgress,
} from '@mui/material';

export default function LoginForm({ onRegisterClick }) {
    const { setUser } = useContext(AuthContext);
    const navigate = useNavigate();               // ← THÊM DÒNG NÀY
    const [form, setForm] = useState({ login: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await authService.login(form);
            setToken(res.data.token);
            setUser(res.data.user);// set trước
            console.log("User set to:", res.data.user); // debug

            navigate("/board");// sau đó mới navigate
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed. Please try again!');
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
                    {/* Title */}
                    <Typography component="h1" variant="h4" fontWeight="bold" color="primary">
                        Login
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1, mb: 4 }}>
                        Welcome back! Please enter your details
                    </Typography>

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
                            label="Email or Username"
                            name="login"
                            value={form.login}
                            onChange={handleChange}
                            autoComplete="username"
                            autoFocus
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
                            autoComplete="current-password"
                        />

                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            size="large"
                            disabled={loading}
                            sx={{ mt: 4, mb: 2, py: 1.5, fontSize: '1.1rem' }}
                        >
                            {loading ? (
                                <>
                                    <CircularProgress size={24} sx={{ mr: 1 }} />
                                    Logging in...
                                </>
                            ) : (
                                'Login'
                            )}
                        </Button>
                    </Box>
                </Box>
            </Paper>
        </Container>
    );
}