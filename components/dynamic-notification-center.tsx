"use client"

import { useState, useEffect, useRef } from "react"
import { Bell, X, Check, AlertTriangle, Info, Award, Building2, Wifi, WifiOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/cards"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Switch } from "@/components/ui/switch"
import { useDynamicNotifications, type DynamicNotification } from "@/hooks/use-dynamic-notifications"

const getNotificationIcon = (type: DynamicNotification["type"]) => {
  switch (type) {
    case "coupon_expiry":
      return <AlertTriangle className="h-4 w-4 text-orange-500" />
    case "usage_alert":
      return <Info className="h-4 w-4 text-blue-500" />
    case "achievement":
      return <Award className="h-4 w-4 text-green-500" />
    case "department_alert":
      return <Building2 className="h-4 w-4 text-purple-500" />
    default:
      return <Bell className="h-4 w-4 text-gray-500" />
  }
}

const getPriorityColor = (priority: DynamicNotification["priority"]) => {
  switch (priority) {
    case "high":
      return "border-l-red-500 bg-red-50"
    case "medium":
      return "border-l-yellow-500 bg-yellow-50"
    case "low":
      return "border-l-blue-500 bg-blue-50"
    default:
      return "border-l-gray-500 bg-gray-50"
  }
}

export function DynamicNotificationCenter() {
  const {
    notifications,
    unreadCount,
    connected,
    markAsRead,
    markAllAsRead,
    removeNotification,
    subscribeToNotifications,
    refresh,
  } = useDynamicNotifications()

  const [open, setOpen] = useState(false)
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [filter, setFilter] = useState<string>("all")
  const refreshIntervalRef = useRef<NodeJS.Timeout>()
  const subscriptionInitialized = useRef(false)

  // Subscribe to notification types on mount (only once)
  useEffect(() => {
    if (!subscriptionInitialized.current) {
      subscriptionInitialized.current = true
      subscribeToNotifications(["coupon_expiry", "usage_alert", "department_alert", "achievement", "system"])
    }

    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current)
      }
    }
  }, []) // Empty dependency array

  // Auto-refresh notifications
  useEffect(() => {
    if (autoRefresh) {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current)
      }

      refreshIntervalRef.current = setInterval(() => {
        refresh()
      }, 60000) // Refresh every minute

      return () => {
        if (refreshIntervalRef.current) {
          clearInterval(refreshIntervalRef.current)
        }
      }
    } else {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current)
      }
    }
  }, [autoRefresh]) // Only depend on autoRefresh

  const formatTime = (timestamp: string) => {
  if (!timestamp) return "Just now";

  try {
    const date = new Date(timestamp);
    const now = new Date();

    // Debugging: Log the parsed date
    console.log("Parsed date:", date);

    if (isNaN(date.getTime())) return "Just now"; // Check if the date is valid

    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  } catch (e) {
    console.error("Error parsing date:", e);
    return "Just now"; // Fallback in case of error
  }
};


  const filteredNotifications = notifications.filter((notification) => {
    if (filter === "all") return true
    if (filter === "unread") return !notification.read
    return notification.type === filter
  })

  const notificationTypes = [
    { value: "all", label: "All" },
    { value: "unread", label: "Unread" },
    { value: "coupon_expiry", label: "Expiry Alerts" },
    { value: "usage_alert", label: "Usage Alerts" },
    { value: "department_alert", label: "Department" },
    { value: "achievement", label: "Achievements" },
  ]

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="relative">
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs animate-pulse"
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </Badge>
          )}
          <span className="sr-only">
            {unreadCount > 0 ? `${unreadCount} unread notifications` : "No unread notifications"}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0" align="end">
        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Live Notifications</CardTitle>
              <div className="flex items-center gap-2">
                {connected ? (
                  <div className="flex items-center gap-1 text-green-600">
                    <Wifi className="h-3 w-3" />
                    <span className="text-xs">Connected</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 text-orange-600">
                    <WifiOff className="h-3 w-3" />
                    <span className="text-xs">Polling</span>
                  </div>
                )}
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-between gap-2 pt-2">
              <div className="flex items-center gap-2">
                <Switch checked={autoRefresh} onCheckedChange={setAutoRefresh} id="auto-refresh" />
                <label htmlFor="auto-refresh" className="text-xs text-muted-foreground">
                  Auto-refresh
                </label>
              </div>

              {unreadCount > 0 && (
                <Button variant="ghost" size="sm" onClick={markAllAsRead} className="text-xs h-6 px-2">
                  Mark all read
                </Button>
              )}
            </div>

            {/* Filter */}
            <div className="flex gap-1 pt-2">
              {notificationTypes.map((type) => (
                <Button
                  key={type.value}
                  variant={filter === type.value ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setFilter(type.value)}
                  className="text-xs h-6 px-2"
                >
                  {type.label}
                </Button>
              ))}
            </div>
          </CardHeader>

          <CardContent className="p-0">
            <ScrollArea className="h-96">
              {filteredNotifications.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground">
                  <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No notifications</p>
                  {filter !== "all" && (
                    <Button variant="ghost" size="sm" onClick={() => setFilter("all")} className="mt-2 text-xs">
                      Show all notifications
                    </Button>
                  )}
                </div>
              ) : (
                <div className="space-y-1">
                  {filteredNotifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-3 border-l-4 ${getPriorityColor(notification.priority)} ${
                        !notification.read ? "bg-opacity-100" : "bg-opacity-50"
                      } hover:bg-opacity-75 transition-all duration-200`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-2 flex-1">
                          {getNotificationIcon(notification.type)}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h4 className={`text-sm font-medium ${!notification.read ? "font-semibold" : ""}`}>
                                {notification.title}
                              </h4>
                              {!notification.read && <div className="h-2 w-2 bg-blue-500 rounded-full animate-pulse" />}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">{notification.message}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <p className="text-xs text-muted-foreground">{formatTime(notification.timestamp)}</p>
                              {notification.department && (
                                <Badge variant="outline" className="text-xs px-1 py-0">
                                  {notification.department}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          {!notification.read && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => markAsRead(notification.id)}
                              className="h-6 w-6 p-0 hover:bg-green-100"
                            >
                              <Check className="h-3 w-3" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeNotification(notification.id)}
                            className="h-6 w-6 p-0 hover:bg-red-100"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </PopoverContent>
    </Popover>
  )
}

                   