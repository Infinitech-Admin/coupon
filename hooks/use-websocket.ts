"use client";

import { useState, useEffect, useRef, useCallback } from "react";

export interface WebSocketMessage {
  type: string;
  data: any;
  timestamp: string;
}

export function useWebSocket(url: string) {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 3; // Reduced attempts
  const isConnecting = useRef(false);
  const shouldConnect = useRef(true);

  const connect = useCallback(() => {
    // Prevent multiple connection attempts
    if (isConnecting.current || !shouldConnect.current) {
      return;
    }

    try {
      // Check if WebSocket is available in the browser
      if (typeof WebSocket === "undefined") {
        setError("WebSocket not supported in this environment");
        return;
      }

      // Don't try to connect if we've exceeded max attempts
      if (reconnectAttempts.current >= maxReconnectAttempts) {
        setError("WebSocket connection failed after multiple attempts");
        return;
      }

      isConnecting.current = true;
      console.log(`Attempting WebSocket connection to ${url}`);

      const ws = new WebSocket(url);

      ws.onopen = () => {
        console.log("WebSocket connected successfully");
        setConnected(true);
        setError(null);
        reconnectAttempts.current = 0;
        isConnecting.current = false;
      };

      ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          setLastMessage(message);
        } catch (err) {
          console.error("Failed to parse WebSocket message:", err);
        }
      };

      ws.onclose = (event) => {
        console.log("WebSocket disconnected:", event.code, event.reason);
        setConnected(false);
        setSocket(null);
        isConnecting.current = false;

        // Only attempt to reconnect if we should and haven't exceeded max attempts
        if (
          shouldConnect.current &&
          reconnectAttempts.current < maxReconnectAttempts
        ) {
          reconnectAttempts.current++;
          const delay = Math.min(
            1000 * Math.pow(2, reconnectAttempts.current),
            10000,
          ); // Max 10 seconds
          console.log(
            `Attempting to reconnect in ${delay}ms (attempt ${reconnectAttempts.current}/${maxReconnectAttempts})`,
          );

          reconnectTimeoutRef.current = setTimeout(() => {
            if (shouldConnect.current) {
              connect();
            }
          }, delay);
        } else {
          setError("WebSocket connection unavailable - using fallback");
        }
      };

      ws.onerror = (error) => {
        console.error("WebSocket error:", error);
        setError("WebSocket connection error - using fallback");
        isConnecting.current = false;
      };

      setSocket(ws);
    } catch (err) {
      setError("Failed to create WebSocket connection - using fallback");
      isConnecting.current = false;
      console.error("WebSocket creation error:", err);
    }
  }, [url]);

  const disconnect = useCallback(() => {
    shouldConnect.current = false;

    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }

    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.close();
    }

    setSocket(null);
    setConnected(false);
    isConnecting.current = false;
  }, [socket]);

  const sendMessage = useCallback(
    (message: any) => {
      if (socket && connected && socket.readyState === WebSocket.OPEN) {
        try {
          socket.send(JSON.stringify(message));
        } catch (err) {
          console.error("Failed to send WebSocket message:", err);
        }
      }
    },
    [socket, connected],
  );

  useEffect(() => {
    // Only try to connect in browser environment and if URL is provided
    if (typeof window !== "undefined" && url && url.startsWith("ws")) {
      shouldConnect.current = true;
      connect();

      return () => {
        shouldConnect.current = false;
        disconnect();
      };
    } else {
      // If no valid WebSocket URL, set error immediately
      setError("WebSocket URL not configured - using fallback");
    }
  }, [url]); // Only depend on URL

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      shouldConnect.current = false;
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, []);

  return {
    connected,
    error,
    lastMessage,
    sendMessage,
    reconnect: connect,
    disconnect,
  };
}
