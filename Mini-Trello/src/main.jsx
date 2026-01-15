import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { CssBaseline } from '@mui/material'
import { CustomThemeProvider } from '~/contexts/ThemeContext'
import { AuthProvider } from '~/contexts/AuthContext'
import AppRoutes from './routes/AppRoutes'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <CustomThemeProvider>
      <CssBaseline />
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </CustomThemeProvider>
  </React.StrictMode>
)
