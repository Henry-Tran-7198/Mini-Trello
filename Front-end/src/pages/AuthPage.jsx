// src/pages/AuthPage.jsx (hoặc nơi bạn đặt)
import { useState } from 'react';
import LoginForm from '../components/AuthForm/LoginForm';
import RegisterForm from '../components/AuthForm/RegisterForm';
import { Box, Typography, Button, Container } from '@mui/material';

export default function AuthPage() {
    const [mode, setMode] = useState('login'); // 'login' | 'register'

    return (
        <Container maxWidth="sm">
            <Box
                sx={{
                    mt: 8,
                    p: 4,
                    borderRadius: 3,
                    boxShadow: 8,
                    bgcolor: 'background.paper',
                }}
            >
                {mode === 'login' ? (
                    <>
                        <LoginForm />
                        <Box sx={{ mt: 3, textAlign: 'center' }}>
                            <Typography variant="body2" color="text.secondary">
                                Already have an account?{' '}
                                <Button
                                    onClick={() => setMode('register')}
                                    color="primary"
                                    sx={{ textTransform: 'none', fontWeight: 'medium' }}
                                >
                                    Register
                                </Button>
                            </Typography>
                        </Box>
                    </>
                ) : (
                    <>
                        <RegisterForm onSuccess={() => setMode('login')} />
                        <Box sx={{ mt: 3, textAlign: 'center' }}>
                            <Typography variant="body2" color="text.secondary">
                                Already have an account?{' '}
                                <Button
                                    onClick={() => setMode('login')}
                                    color="primary"
                                    sx={{ textTransform: 'none', fontWeight: 'medium' }}
                                >
                                    Login
                                </Button>
                            </Typography>
                        </Box>
                    </>
                )}
            </Box>
        </Container>
    );
}