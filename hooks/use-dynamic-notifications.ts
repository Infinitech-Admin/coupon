"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useWebSocket } from "./use-websocket";

export interface DynamicNotification {
  id: string;
  type:
    | "coupon_expiry"
    | "usage_alert"
    | "system"
    | "achievement"
    | "department_alert";
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  priority: "low" | "medium" | "high";
  data?: any;
  department?: string;
  employee_id?: number;
  hash?: string; // For deduplication
}

export function useDynamicNotifications() {
  const [notifications, setNotifications] = useState<DynamicNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isInitialized, setIsInitialized] = useState(false);
  const initializationRef = useRef(false);
  const lastNotificationHashes = useRef(new Set<string>());
  const notificationCooldown = useRef(new Map<string, number>());

  // WebSocket connection for real-time notifications (optional)
  const wsUrl = process.env.NEXT_PUBLIC_WS_URL || "";
  const { connected, lastMessage, sendMessage } = useWebSocket(wsUrl);

  // Server-Sent Events as primary method - but with much longer intervals
  const [sseConnected, setSseConnected] = useState(false);
  const eventSourceRef = useRef<EventSource | null>(null);
  const pollIntervalRef = useRef<NodeJS.Timeout>();

  // Create a hash for notification deduplication
  const createNotificationHash = useCallback((data: any) => {
    const hashContent = `${data.type}_${data.title}_${data.message}_${data.department || ""}_${data.employee_id || ""}`;
    return btoa(hashContent)
      .replace(/[^a-zA-Z0-9]/g, "")
      .substring(0, 16);
  }, []);

  // Check if notification should be shown (deduplication + cooldown)
  const shouldShowNotification = useCallback((hash: string, type: string) => {
    const now = Date.now();
    const cooldownKey = `${type}_${hash}`;
    const lastShown = notificationCooldown.current.get(cooldownKey) || 0;
    const cooldownPeriod = type === "coupon_expiry" ? 300000 : 180000; // 5 min for expiry, 3 min for others

    // Check if we've shown this notification recently
    if (now - lastShown < cooldownPeriod) {
      return false;
    }

    // Check if we've seen this exact notification before
    if (lastNotificationHashes.current.has(hash)) {
      return false;
    }

    return true;
  }, []);

  // Use polling instead of SSE to reduce spam
  const pollForNotifications = useCallback(async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
      const response = await fetch(`${apiUrl}/api/notifications`, {
        headers: { Accept: "application/json" },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.notifications && Array.isArray(data.notifications)) {
          // Process only new notifications
          const newNotifications = data.notifications.filter((notif: any) => {
            const hash = createNotificationHash(notif);
            return shouldShowNotification(hash, notif.type);
          });

          if (newNotifications.length > 0) {
            newNotifications.forEach((notif: any) => {
              const hash = createNotificationHash(notif);
              handleIncomingNotification({ ...notif, hash });
            });
          }
        }
      }
    } catch (error) {
      console.error("Failed to poll notifications:", error);
    }
  }, [createNotificationHash, shouldShowNotification]);

  // Initialize polling instead of SSE
  useEffect(() => {
    if (typeof window === "undefined" || initializationRef.current) return;

    initializationRef.current = true;

    // Start with immediate fetch, then poll every 2 minutes
    pollForNotifications();

    pollIntervalRef.current = setInterval(() => {
      pollForNotifications();
    }, 120000); // Poll every 2 minutes instead of constant SSE

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
      initializationRef.current = false;
    };
  }, [pollForNotifications]);

  // Handle WebSocket messages (if available)
  useEffect(() => {
    if (lastMessage && lastMessage.data) {
      const hash = createNotificationHash(lastMessage.data);
      if (shouldShowNotification(hash, lastMessage.data.type)) {
        handleIncomingNotification({ ...lastMessage.data, hash });
      }
    }
  }, [lastMessage, createNotificationHash, shouldShowNotification]);

  const handleIncomingNotification = useCallback(
    (data: any) => {
      if (!data || !data.title) return;

      const hash = data.hash || createNotificationHash(data);

      // Double-check deduplication
      if (!shouldShowNotification(hash, data.type)) {
        return;
      }

      const notification: DynamicNotification = {
        id:
          data.id || `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: data.type || "system",
        title: data.title,
        message: data.message || "",
        timestamp: data.timestamp || new Date().toISOString(),
        read: false,
        priority: data.priority || "medium",
        data: data.data,
        department: data.department,
        employee_id: data.employee_id,
        hash: hash,
      };

      // Mark this notification as seen
      lastNotificationHashes.current.add(hash);
      notificationCooldown.current.set(`${data.type}_${hash}`, Date.now());

      // Clean up old hashes (keep only last 100)
      if (lastNotificationHashes.current.size > 100) {
        const hashArray = Array.from(lastNotificationHashes.current);
        lastNotificationHashes.current = new Set(hashArray.slice(-50));
      }

      setNotifications((prev) => {
        // Check if notification with same hash already exists
        const exists = prev.some((n) => n.hash === hash);
        if (exists) return prev;

        return [notification, ...prev.slice(0, 49)]; // Keep last 50
      });

      setUnreadCount((prev) => prev + 1);

      // Show browser notification only for high priority and if permission granted
      if (
        data.priority === "high" &&
        typeof window !== "undefined" &&
        "Notification" in window &&
        Notification.permission === "granted"
      ) {
        try {
          new Notification(notification.title, {
            body: notification.message,
            icon: "/favicon.ico",
            tag: hash, // Use hash as tag to prevent duplicates
            requireInteraction: false,
            silent: false,
          });
        } catch (err) {
          console.error("Failed to show browser notification:", err);
        }
      }
    },
    [createNotificationHash, shouldShowNotification],
  );

  // Request notification permission only when needed
  const requestNotificationPermission = useCallback(async () => {
    if (
      typeof window !== "undefined" &&
      "Notification" in window &&
      Notification.permission === "default"
    ) {
      try {
        await Notification.requestPermission();
      } catch (err) {
        console.error("Failed to request notification permission:", err);
      }
    }
  }, []);

  // Fetch initial notifications only once
  const fetchInitialNotifications = useCallback(async () => {
    if (isInitialized) return;

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
      const response = await fetch(`${apiUrl}/api/notifications`, {
        headers: { Accept: "application/json" },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.notifications && Array.isArray(data.notifications)) {
          // Add hashes to existing notifications and mark them as seen
          const processedNotifications = data.notifications.map(
            (notif: any) => {
              const hash = createNotificationHash(notif);
              lastNotificationHashes.current.add(hash);
              return { ...notif, hash };
            },
          );

          setNotifications(processedNotifications);
          setUnreadCount(
            data.unread_count ||
              processedNotifications.filter((n: DynamicNotification) => !n.read)
                .length,
          );
        }
      }
    } catch (error) {
      console.error("Failed to fetch initial notifications:", error);
    } finally {
      setIsInitialized(true);
    }
  }, [isInitialized, createNotificationHash]);

  useEffect(() => {
    fetchInitialNotifications();
  }, [fetchInitialNotifications]);

  const markAsRead = useCallback(async (id: string) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
      await fetch(`${apiUrl}/api/notifications/${id}/read`, {
        method: "POST",
        headers: { Accept: "application/json" },
      });

      setNotifications((prev) =>
        prev.map((notif) =>
          notif.id === id ? { ...notif, read: true } : notif,
        ),
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
      await fetch(`${apiUrl}/api/notifications/read-all`, {
        method: "POST",
        headers: { Accept: "application/json" },
      });

      setNotifications((prev) =>
        prev.map((notif) => ({ ...notif, read: true })),
      );
      setUnreadCount(0);
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error);
    }
  }, []);

  const removeNotification = useCallback(async (id: string) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
      await fetch(`${apiUrl}/api/notifications/${id}`, {
        method: "DELETE",
        headers: { Accept: "application/json" },
      });

      setNotifications((prev) => prev.filter((notif) => notif.id !== id));
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Failed to remove notification:", error);
    }
  }, []);

  const subscribeToNotifications = useCallback(
    (types: string[]) => {
      if (connected) {
        sendMessage({
          action: "subscribe",
          types: types,
        });
      }
    },
    [connected, sendMessage],
  );

  // Manual refresh with deduplication
  const refresh = useCallback(() => {
    if (isInitialized) {
      pollForNotifications();
    }
  }, [isInitialized, pollForNotifications]);

  // Clear notification cooldowns periodically
  useEffect(() => {
    const cleanupInterval = setInterval(() => {
      const now = Date.now();
      const entries = Array.from(notificationCooldown.current.entries());

      entries.forEach(([key, timestamp]) => {
        if (now - timestamp > 600000) {
          // Remove entries older than 10 minutes
          notificationCooldown.current.delete(key);
        }
      });
    }, 300000); // Clean up every 5 minutes

    return () => clearInterval(cleanupInterval);
  }, []);

  return {
    notifications,
    unreadCount,
    connected: connected || sseConnected,
    markAsRead,
    markAllAsRead,
    removeNotification,
    subscribeToNotifications,
    refresh,
    requestNotificationPermission,
  };
}
