// import Board from '../src/pages/Boards/_id';



// function App() {
//   return (
//     <>
//       <Board />
//     </>
//   )
// }

// export default App
/*
*
*
*/

import { AuthProvider } from './contexts/AuthContext';
import Home from '../../Mini-Trello/src/pages/home';
import './styles/App.css';

function App() {
    return (
        <AuthProvider>
            <Home />
        </AuthProvider>
    );
}

export default App;
