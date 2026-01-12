// // import Board from '../src/pages/Boards/_id';
//
//
//
// // function App() {
// //   return (
// //     <>
// //       <Board />
// //     </>
// //   )
// // }
//
// // export default App
// /*
// *
// *
// */
//
// import { AuthProvider } from './contexts/AuthContext';
// import Home from '../../Mini-Trello/src/pages/home';
// import './styles/App.css';
//
// function App() {
//     return (
//         <AuthProvider>
//             <Home />
//         </AuthProvider>
//     );
// }
//
// export default App;
// src/App.jsx
// src/components/Auth_form/RegisterForm.jsx
/*
*
*
* */


import { AuthProvider } from './contexts/AuthContext';
import AuthPage from './pages/AuthPage';
import Home from './pages/Home';
import { useContext } from 'react';
import { AuthContext } from './contexts/AuthContext';

function AppContent() {
    const { user } = useContext(AuthContext);
    return user ? <Home /> : <AuthPage />;
}

export default function App() {
    return (
        <AuthProvider>
            <AppContent />
        </AuthProvider>
    );
}


