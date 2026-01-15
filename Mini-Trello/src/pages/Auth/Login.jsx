import { Box, Button, TextField, Typography, Paper, Alert } from '@mui/material'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTheme } from '@mui/material/styles'
import { authApi } from '~/api/authApi'

export default function Login() {
  const theme = useTheme()
  const navigate = useNavigate()
  const [login, setLogin] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async e => {
    e.preventDefault()
    setError('')

    try {
      console.log('Submitting login:', { login, password })
      const res = await authApi.login({ login, password })
      console.log('Login success:', res.data)
      localStorage.setItem('token', res.data.token)
      navigate('/')
    } catch (err) {
      const errorMessage = err?.response?.data?.message || 'Login failed'
      console.error('Login error:', err?.response?.data || err.message)
      setError(errorMessage)
    }
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: theme.palette.primary.main, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Paper sx={{ p: 4, width: 360 }}>
        <Typography variant="h5" fontWeight="bold" textAlign="center">
          Login
        </Typography>

        {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}

        <form onSubmit={handleSubmit}>
          <TextField label="Username or Email" fullWidth margin="normal" value={login} onChange={e => setLogin(e.target.value)} required />
          <TextField label="Password" type="password" fullWidth margin="normal" value={password} onChange={e => setPassword(e.target.value)} required />

          <Button type="submit" variant="contained" fullWidth sx={{ mt: 2 }}>
            Login
          </Button>
        </form>

        <Box sx={{ mt: 3, textAlign: 'center' }}>
          <Typography variant="body2">
            Don't have an account?{' '}
            <Typography
              component="span"
              variant="body2"
              sx={{ color: theme.palette.primary.main, cursor: 'pointer', fontWeight: 'bold', '&:hover': { textDecoration: 'underline' } }}
              onClick={() => navigate('/register')}
            >
              Register here
            </Typography>
          </Typography>
        </Box>
      </Paper>
    </Box>
  )
}
