// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { Experimental_CssVarsProvider as CssVarsProvider } from '@mui/material/styles';
import theme from './theme';

import { AuthProvider } from './Contexts/AuthContext';
import { RouterProvider } from 'react-router-dom';
import router from './routes/router';

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <AuthProvider>
            <CssVarsProvider theme={theme}>
                <RouterProvider router={router} />
            </CssVarsProvider>
        </AuthProvider>
    </React.StrictMode>
);