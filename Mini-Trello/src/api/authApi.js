import axios from './axios'

export const authApi = {
  login(data) {
    // data: { login, password }
    return axios.post('/login', data)
  },

  register(data) {
    // data: FormData with { email, username, password, password_confirmation, avatar }
    return axios.post('/register', data, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  },

  me() {
    return axios.get('/me')
  },

  logout() {
    return axios.post('/logout')
  }
}
