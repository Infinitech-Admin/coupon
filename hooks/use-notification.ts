import { useState, useEffect, useCallback } from "react";

export interface Notification {
  id: string;
  type: "coupon_expiry" | "usage_alert" | "system" | "achievement";
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  priority: "low" | "medium" | "high";
  data?: any;
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [connected, setConnected] = useState(false);

  // Simulate real-time notifications (in production, use WebSocket or SSE)
  useEffect(() => {
    const interval = setInterval(() => {
      // Check for coupon expiry notifications
      checkCouponExpiry();
      // Check for usage pattern alerts
      checkUsageAlerts();
    }, 30000); // Check every 30 seconds

    setConnected(true);
    return () => {
      clearInterval(interval);
      setConnected(false);
    };
  }, []);

  const checkCouponExpiry = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
      const response = await fetch(`${apiUrl}/api/coupons/expiring-soon`, {
        headers: { Accept: "application/json" },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.expiring_count > 0) {
          addNotification({
            type: "coupon_expiry",
            title: "Coupons Expiring Soon",
            message: `${data.expiring_count} coupons will expire in the next 24 hours`,
            priority: "high",
            data: { count: data.expiring_count },
          });
        }
      }
    } catch (error) {
      console.error("Error checking coupon expiry:", error);
    }
  };

  const checkUsageAlerts = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
      const response = await fetch(`${apiUrl}/api/analytics/usage-alerts`, {
        headers: { Accept: "application/json" },
      });

      if (response.ok) {
        const data = await response.json();
        data.alerts?.forEach((alert: any) => {
          addNotification({
            type: "usage_alert",
            title: alert.title,
            message: alert.message,
            priority: alert.priority || "medium",
            data: alert.data,
          });
        });
      }
    } catch (error) {
      console.error("Error checking usage alerts:", error);
    }
  };

  const addNotification = useCallback(
    (notification: Omit<Notification, "id" | "timestamp" | "read">) => {
      const newNotification: Notification = {
        ...notification,
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        timestamp: new Date(),
        read: false,
      };

      setNotifications((prev) => [newNotification, ...prev.slice(0, 49)]); // Keep last 50
      setUnreadCount((prev) => prev + 1);
    },
    [],
  );

  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((notif) => (notif.id === id ? { ...notif, read: true } : notif)),
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((notif) => ({ ...notif, read: true })));
    setUnreadCount(0);
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((notif) => notif.id !== id));
    setUnreadCount((prev) => Math.max(0, prev - 1));
  }, []);

  return {
    notifications,
    unreadCount,
    connected,
    addNotification,
    markAsRead,
    markAllAsRead,
    removeNotification,
  };
}
