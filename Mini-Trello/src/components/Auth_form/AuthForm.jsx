// src/components/Auth_form/AuthForm.jsx
import { useState } from 'react';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';

export default function AuthForm() {
    const [mode, setMode] = useState('login'); // login | register

    return (
        <div className="auth-wrapper">
            {mode === 'login' ? (
                <>
                    <LoginForm />
                    <p>
                        Chưa có tài khoản?{' '}
                        <button onClick={() => setMode('register')}>
                            Đăng ký
                        </button>
                    </p>
                </>
            ) : (
                <>
                    <RegisterForm onSuccess={() => setMode('login')} />
                    <p>
                        Đã có tài khoản?{' '}
                        <button onClick={() => setMode('login')}>
                            Đăng nhập
                        </button>
                    </p>
                </>
            )}
        </div>
    );
}
