import Echo from "laravel-echo";
import Pusher from "pusher-js";

// Disable Pusher logging in production
Pusher.logToConsole = import.meta.env.DEV;

// Initialize Echo for WebSocket connection
const echo = new Echo({
  broadcaster: "pusher",
  key: import.meta.env.VITE_PUSHER_APP_KEY || "local",
  cluster: import.meta.env.VITE_PUSHER_CLUSTER || "mt1",
  encrypted: import.meta.env.PROD,

  // For local development, connect to local Pusher server
  wsHost: import.meta.env.PROD ? undefined : window.location.hostname,
  wsPort: import.meta.env.PROD ? undefined : 6001,
  wssPort: import.meta.env.PROD ? undefined : 6001,
  forceTLS: import.meta.env.PROD,
  disableStats: true,

  auth: {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  },
});

// Listen for connection errors
echo.connector.socket.on("error", (error) => {
  console.warn("WebSocket connection error. Using fallback polling:", error);
});

echo.connector.socket.on("connected", () => {
  console.log("WebSocket connected - Real-time updates active");
});

export default echo;
