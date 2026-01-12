import { useState } from 'react';
import LoginForm from '../components/Auth_form/LoginForm';
import RegisterForm from '../components/Auth_form/RegisterForm';

export default function AuthPage() {
    const [mode, setMode] = useState('login'); // 'login' | 'register'

    return (
        <div style={{ maxWidth: 400, margin: '50px auto' }}>
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
