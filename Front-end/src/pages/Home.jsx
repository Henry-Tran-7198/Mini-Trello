import { useContext } from 'react';
import { AuthContext } from '../Contexts/AuthContext';
import LogoutButton from '../components/Auth_form/LogoutButton';
import AuthPage from './AuthPage';

export default function Home() {
    const { user } = useContext(AuthContext);

    if (!user) {
        return <AuthPage />;
    }

    return (
        <div>
            <h1>Welcome {user.name}</h1>
            <LogoutButton />
        </div>
    );
}
