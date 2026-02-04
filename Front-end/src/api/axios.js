import axios from "axios";

// Log interceptor para debug
const consoleLog = (msg, data) => {
  console.log(msg, data);
  // Also log to window for debugging
  if (!window.__logBuffer) window.__logBuffer = [];
  window.__logBuffer.push({ msg, data, time: new Date().toISOString() });
};

const instance = axios.create({
  baseURL: "http://localhost:8000/api",
  headers: { Accept: "application/json" },
});

instance.interceptors.request.use((config) => {
  // Check sessionStorage first (current tab token)
  // Then fall back to localStorage (legacy/shared token)
  const token =
    sessionStorage.getItem("token") || localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  console.log("🔴 AXIOS REQUEST INTERCEPTOR:", {
    method: config.method,
    url: config.url,
    data: config.data,
    headers: config.headers,
  });
  return config;
});

// Handle 401 errors (invalid/revoked token)
instance.interceptors.response.use(
  (response) => {
    console.log("🔴 AXIOS RESPONSE INTERCEPTOR - SUCCESS:", {
      status: response.status,
      url: response.config.url,
      data: response.data,
    });
    return response;
  },
  (error) => {
    console.log("🔴 AXIOS RESPONSE INTERCEPTOR - ERROR:", {
      status: error?.response?.status,
      url: error?.config?.url,
      message: error?.response?.data?.message,
      isNetworkError: !error?.response,
    });
    if (error?.response?.status === 401) {
      // Clear tokens from both storages
      sessionStorage.removeItem("token");
      localStorage.removeItem("token");

      // Show message based on error
      const message = error?.response?.data?.message || "Unauthorized";
      if (message.includes("Session expired")) {
        // Store message to show on login page
        sessionStorage.setItem("sessionExpiredMessage", message);
      }

      // Redirect to login page
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default instance;
