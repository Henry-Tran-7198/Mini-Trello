// Real-time event stream service using Server-Sent Events
// This provides true real-time updates without WebSocket complexity

class EventStreamService {
  constructor() {
    this.eventSource = null;
    this.listeners = {};
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000;
  }

  /**
   * Start listening to server-sent events
   */
  connect(token) {
    if (this.eventSource) {
      return; // Already connected
    }

    const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

    this.eventSource = new EventSource(`${apiUrl}/events/stream`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    // Handle incoming events
    this.eventSource.addEventListener("message", (event) => {
      try {
        const data = JSON.parse(event.data);
        this.emit(data.type, data);
      } catch (error) {
        console.error("Error parsing event:", error);
      }
    });

    // Handle connection open
    this.eventSource.addEventListener("open", () => {
      console.log("Real-time connection established");
      this.reconnectAttempts = 0;
      this.reconnectDelay = 1000;
    });

    // Handle connection errors
    this.eventSource.addEventListener("error", () => {
      console.warn("Real-time connection lost, attempting to reconnect...");
      this.disconnect();
      this.reconnect(token);
    });
  }

  /**
   * Reconnect with exponential backoff
   */
  reconnect(token) {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      setTimeout(() => {
        this.connect(token);
      }, this.reconnectDelay);
      this.reconnectDelay *= 2; // Exponential backoff
    } else {
      console.error(
        "Failed to reconnect after max attempts, falling back to polling",
      );
    }
  }

  /**
   * Disconnect from server
   */
  disconnect() {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
  }

  /**
   * Subscribe to an event type
   */
  on(eventType, callback) {
    if (!this.listeners[eventType]) {
      this.listeners[eventType] = [];
    }
    this.listeners[eventType].push(callback);
  }

  /**
   * Unsubscribe from an event type
   */
  off(eventType, callback) {
    if (this.listeners[eventType]) {
      this.listeners[eventType] = this.listeners[eventType].filter(
        (cb) => cb !== callback,
      );
    }
  }

  /**
   * Emit an event to all listeners
   */
  emit(eventType, data) {
    if (this.listeners[eventType]) {
      this.listeners[eventType].forEach((callback) => {
        callback(data);
      });
    }
  }

  /**
   * Check if connected
   */
  isConnected() {
    return this.eventSource && this.eventSource.readyState === EventSource.OPEN;
  }
}

// Export singleton instance
const eventStream = new EventStreamService();
export default eventStream;
