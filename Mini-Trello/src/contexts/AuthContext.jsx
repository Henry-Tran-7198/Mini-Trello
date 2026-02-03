import { createContext, useState, useEffect } from "react";
import axiosInstance from "~/api/axios";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token =
      sessionStorage.getItem("token") || localStorage.getItem("token");
    if (token) {
      axiosInstance
        .get("/me")
        .then((res) => setUser(res.data))
        .catch(() => logout());
    }
  }, []);

  const login = async (login, password) => {
    try {
      const res = await axiosInstance.post("/login", { login, password });
      localStorage.setItem("token", res.data.token);
      setUser(res.data.user);

      // Fetch fresh user data to ensure avatar loaded
      setTimeout(() => {
        axiosInstance
          .get("/me")
          .then((res) => setUser(res.data))
          .catch(() => {});
      }, 100);
    } catch (error) {
      console.error("Login error:", error.response?.data || error.message);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
