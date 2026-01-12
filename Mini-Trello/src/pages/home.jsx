import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import LoginForm from '../components/Auth_form/LoginForm';
import RegisterForm from '../components/Auth_form/RegisterForm';
import LogoutButton from '../components/Auth_form/LogoutButton';
import AvatarUpload from '../components/Auth_form/AvatarUpload';

export default function Home() {
    const { user } = useContext(AuthContext);

    if (!user) {
        return (
            <div>
                <h1>Register</h1>
                <RegisterForm />
                <h1>Login</h1>
                <LoginForm />
            </div>
        );
    }

    return (
        <div>
            <h1>Welcome, {user.username}</h1>
            <img src={user.avatar} alt="avatar" width={100} />
            <AvatarUpload />
            <LogoutButton />
        </div>
    );
}
