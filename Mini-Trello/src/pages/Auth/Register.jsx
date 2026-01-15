import { Box, Button, TextField, Typography, Paper, Alert } from '@mui/material'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTheme } from '@mui/material/styles'
import CloudUploadIcon from '@mui/icons-material/CloudUpload'
import { authApi } from '~/api/authApi'

export default function Register() {
  const theme = useTheme()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    email: '',
    username: '',
    password: ''
  })

  const [avatar, setAvatar] = useState(null)
  const [avatarPreview, setAvatarPreview] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = e =>
    setForm({ ...form, [e.target.name]: e.target.value })

  const handleAvatarChange = e => {
    const file = e.target.files?.[0]
    if (file) {
      setAvatar(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setAvatarPreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async e => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const formData = new FormData()
      formData.append('email', form.email)
      formData.append('username', form.username)
      formData.append('password', form.password)
      formData.append('password_confirmation', form.password)
      if (avatar) {
        formData.append('avatar', avatar)
      }

      console.log('Submitting register:', { email: form.email, username: form.username })
      const res = await authApi.register(formData)
      console.log('Register success:', res.data)
      navigate('/login')
    } catch (err) {
      const errorMessage = err?.response?.data?.message || err?.response?.data?.errors || 'Register failed'
      console.error('Register error:', err?.response?.data || err.message)
      setError(typeof errorMessage === 'string' ? errorMessage : JSON.stringify(errorMessage))
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: theme.palette.primary.main, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Paper sx={{ p: 4, width: 360 }}>
        <Typography variant="h5" fontWeight="bold" textAlign="center">
          Register
        </Typography>

        {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}

        <form onSubmit={handleSubmit}>
          <TextField name="email" label="Email" type="email" fullWidth margin="normal" value={form.email} onChange={handleChange} required />
          <TextField name="username" label="Username" fullWidth margin="normal" value={form.username} onChange={handleChange} required />
          <TextField name="password" label="Password" type="password" fullWidth margin="normal" value={form.password} onChange={handleChange} required />

          {/* Avatar Upload */}
          <Box sx={{ mt: 2 }}>
            <input
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              style={{ display: 'none' }}
              id="avatar-input"
            />
            <label htmlFor="avatar-input" style={{ width: '100%' }}>
              <Button
                component="span"
                variant="outlined"
                fullWidth
                startIcon={<CloudUploadIcon />}
                sx={{ textTransform: 'none' }}
              >
                {avatar ? 'Change Avatar' : 'Upload Avatar'}
              </Button>
            </label>
            {avatarPreview && (
              <Box sx={{ mt: 2, textAlign: 'center' }}>
                <img
                  src={avatarPreview}
                  alt="Avatar preview"
                  style={{ width: 100, height: 100, borderRadius: '50%', objectFit: 'cover' }}
                />
              </Box>
            )}
          </Box>

          <Button type="submit" variant="contained" fullWidth sx={{ mt: 3 }} disabled={loading}>
            {loading ? 'Creating...' : 'Register'}
          </Button>
        </form>

        <Box sx={{ mt: 3, textAlign: 'center' }}>
          <Typography variant="body2">
            Already have an account?{' '}
            <Typography
              component="span"
              variant="body2"
              sx={{ color: theme.palette.primary.main, cursor: 'pointer', fontWeight: 'bold', '&:hover': { textDecoration: 'underline' } }}
              onClick={() => navigate('/login')}
            >
              Login here
            </Typography>
          </Typography>
        </Box>
      </Paper>
    </Box>
  )
}
