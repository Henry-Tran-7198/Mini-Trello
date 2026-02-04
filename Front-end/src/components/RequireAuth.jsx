import { Navigate } from "react-router-dom";

export default function RequireAuth({ children }) {
  // Check sessionStorage first (current tab), then localStorage (legacy/fallback)
  const token =
    sessionStorage.getItem("token") || localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/login" />;
  }
  return children;
}
