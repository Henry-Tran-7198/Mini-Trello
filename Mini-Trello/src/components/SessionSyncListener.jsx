import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

/**
 * Listen to storage changes across tabs
 * Only logout if token is explicitly deleted (logout action)
 * Allow multiple accounts in different tabs (sessionStorage per tab)
 */
export default function SessionSyncListener({ children }) {
  const navigate = useNavigate();

  useEffect(() => {
    // Listen to storage changes (from other tabs) - localStorage only
    const handleStorageChange = (e) => {
      // Only react to localStorage token removal (explicit logout from another tab)
      // Don't logout if token changes (allows multiple accounts in different tabs)
      if (e.key === "token" && e.newValue === null && e.oldValue !== null) {
        // Token was explicitly deleted from another tab (logout action)
        localStorage.removeItem("token");
        sessionStorage.removeItem("token");
        navigate("/login", { replace: true });
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [navigate]);

  return children;
}
