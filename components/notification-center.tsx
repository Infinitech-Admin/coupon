"use client"

import { useState, useEffect } from "react"
import { Bell, Check, Trash2 } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/libs/utils"
import { getNotifications, markAsRead, markAllAsRead, deleteNotification } from "@/libs/notifications"
import type { Notification } from "@/types/notification"

export function NotificationCenter() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [open, setOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("all")
  const { toast } = useToast()

  // Fetch notifications on mount and when popover opens
  useEffect(() => {
    if (open) {
      fetchNotifications()
    }
  }, [open])

  // Set up SSE connection for real-time notifications
  useEffect(() => {
    let eventSource: EventSource | null = null
    let reconnectTimeout: NodeJS.Timeout | null = null

    const connectSSE = () => {
      try {
        // Only attempt SSE connection if the popover is open or we have notifications
        eventSource = new EventSource("/api/notifications/stream")

        eventSource.onopen = () => {
          console.log("SSE connection opened")
        }

        eventSource.onmessage = (event) => {
          try {
            const newNotifications = JSON.parse(event.data)
            if (newNotifications && newNotifications.length > 0) {
              setNotifications((prev) => {
                // Merge new notifications with existing ones, avoiding duplicates
                const merged = [...prev]
                newNotifications.forEach((newNotif: any) => {
                  const exists = merged.some((n) => n.id === newNotif.id)
                  if (!exists) {
                    merged.unshift(newNotif)
                    // Show toast for high priority notifications
                    if (newNotif.priority === "high" && !newNotif.read) {
                      toast({
                        title: newNotif.title,
                        description: newNotif.message,
                        variant: "default",
                      })
                    }
                  }
                })
                return merged
              })

              // Update unread count
              setUnreadCount((prev) => prev + newNotifications.filter((n: any) => !n.read).length)
            }
          } catch (parseError) {
            console.error("Error parsing SSE data:", parseError)
          }
        }

        eventSource.onerror = (error) => {
          console.warn("SSE connection error, falling back to polling:", error)
          eventSource?.close()

          // Set up reconnection with exponential backoff
          if (!reconnectTimeout) {
            reconnectTimeout = setTimeout(() => {
              reconnectTimeout = null
              // Don't reconnect immediately, just fall back to polling
              console.log("Falling back to periodic polling instead of SSE")
            }, 5000)
          }
        }
      } catch (error) {
        console.error("Failed to establish SSE connection:", error)
      }
    }

    // Try to connect SSE, but don't fail if it doesn't work
    connectSSE()

    return () => {
      if (eventSource) {
        eventSource.close()
      }
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout)
      }
    }
  }, [toast])

  // Fallback polling when SSE fails
  useEffect(() => {
    const pollInterval = setInterval(() => {
      // Only poll if we don't have an active SSE connection
      fetchNotifications().catch((error) => {
        console.error("Polling failed:", error)
      })
    }, 45000) // Poll every 45 seconds as fallback

    return () => clearInterval(pollInterval)
  }, [])

  const fetchNotifications = async () => {
    try {
      const response = await getNotifications()
      setNotifications(response.notifications)
      setUnreadCount(response.unread_count)
    } catch (error) {
      console.error("Failed to fetch notifications:", error)
    }
  }

  const handleMarkAsRead = async (id: number) => {
    try {
      await markAsRead(id)
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))
      setUnreadCount((prev) => Math.max(0, prev - 1))
    } catch (error) {
      console.error("Failed to mark notification as read:", error)
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead()
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
      setUnreadCount(0)
      toast({
        title: "All notifications marked as read",
        variant: "default",
      })
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error)
    }
  }

  const handleDeleteNotification = async (id: number) => {
    try {
      await deleteNotification(id)
      const deleted = notifications.find((n) => n.id === id)
      setNotifications((prev) => prev.filter((n) => n.id !== id))
      if (deleted && !deleted.read) {
        setUnreadCount((prev) => Math.max(0, prev - 1))
      }
    } catch (error) {
      console.error("Failed to delete notification:", error)
    }
  }

  const filteredNotifications = notifications.filter((notification) => {
    if (activeTab === "all") return true
    if (activeTab === "unread") return !notification.read
    return notification.type === activeTab
  })

  const getNotificationTypeCount = (type: string) => {
    return notifications.filter((n) => n.type === type).length
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-500"
      case "medium":
        return "bg-yellow-500"
      case "low":
        return "bg-blue-500"
      default:
        return "bg-gray-500"
    }
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.round(diffMs / 60000)

    if (diffMins < 1) return "Just now"
    if (diffMins < 60) return `${diffMins}m ago`

    const diffHours = Math.floor(diffMins / 60)
    if (diffHours < 24) return `${diffHours}h ago`

    const diffDays = Math.floor(diffHours / 24)
    if (diffDays < 7) return `${diffDays}d ago`

    return date.toLocaleDateString()
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              className="absolute -top-2 -right-2 px-1.5 py-0.5 min-w-[1.25rem] h-5 flex items-center justify-center"
              variant="destructive"
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[380px] p-0" align="end">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-semibold">Notifications</h3>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" onClick={handleMarkAllAsRead} className="text-xs h-8">
              <Check className="h-3.5 w-3.5 mr-1" />
              Mark all as read
            </Button>
          )}
        </div>

        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="border-b px-1">
            <TabsList className="grid grid-cols-4">
              <TabsTrigger value="all" className="text-xs">
                All
                <Badge variant="outline" className="ml-1 px-1 py-0 text-xs">
                  {notifications.length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="unread" className="text-xs">
                Unread
                <Badge variant="outline" className="ml-1 px-1 py-0 text-xs">
                  {unreadCount}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="coupon_expiry" className="text-xs">
                Expiry
                <Badge variant="outline" className="ml-1 px-1 py-0 text-xs">
                  {getNotificationTypeCount("coupon_expiry")}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="department_alert" className="text-xs">
                Alerts
                <Badge variant="outline" className="ml-1 px-1 py-0 text-xs">
                  {getNotificationTypeCount("department_alert")}
                </Badge>
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value={activeTab} className="mt-0 focus-visible:outline-none focus-visible:ring-0">
            <ScrollArea className="h-[300px]">
              {filteredNotifications.length > 0 ? (
                <div className="divide-y">
                  {filteredNotifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={cn(
                        "p-4 relative hover:bg-muted/50 transition-colors",
                        !notification.read && "bg-muted/30",
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <div className={cn("w-2 h-2 rounded-full mt-1.5", getPriorityColor(notification.priority))} />
                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <h4 className="font-medium text-sm">{notification.title}</h4>
                            <span className="text-xs text-muted-foreground">
                              {formatTimestamp(notification.timestamp)}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">{notification.message}</p>

                          {/* Action buttons */}
                          <div className="flex justify-end gap-2 mt-2">
                            {!notification.read && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 px-2 text-xs"
                                onClick={() => handleMarkAsRead(notification.id)}
                              >
                                <Check className="h-3.5 w-3.5 mr-1" />
                                Mark read
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 px-2 text-xs text-destructive hover:text-destructive"
                              onClick={() => handleDeleteNotification(notification.id)}
                            >
                              <Trash2 className="h-3.5 w-3.5 mr-1" />
                              Delete
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full py-8 text-center">
                  <Bell className="h-10 w-10 text-muted-foreground mb-3 opacity-20" />
                  <p className="text-muted-foreground">No notifications to display</p>
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </PopoverContent>
    </Popover>
  )
}
