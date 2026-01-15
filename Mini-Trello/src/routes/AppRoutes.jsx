import { Routes, Route, Navigate } from 'react-router-dom'
import Login from '~/pages/Auth/Login'
import Register from '~/pages/Auth/Register'
import Boards from '~/pages/Boards'
import RequireAuth from '~/components/RequireAuth'

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route
        path="/"
        element={
          <RequireAuth>
            <Boards />
          </RequireAuth>
        }
      />

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  )
}
