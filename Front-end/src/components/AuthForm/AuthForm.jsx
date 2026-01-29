// src/components/Auth_form/AuthForm.jsx
import { useState } from 'react';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';

export default function AuthForm() {
    const [mode, setMode] = useState('login'); // 'login' | 'register'

    return (
        <div className="auth-wrapper">
            {mode === 'login' ? (
                <LoginForm onRegisterClick={() => setMode('register')} />
            ) : (
                <RegisterForm onSuccess={() => setMode('login')} />
            )}
        </div>
    );
}