import type { Notification } from "@/types/notification"

// API URL - replace with your actual API URL in production
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"

// Get all notifications
export async function getNotifications(): Promise<{ notifications: Notification[]; unread_count: number }> {
  const response = await fetch(`${API_URL}/notifications`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    credentials: "include",
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch notifications: ${response.status}`)
  }

  return response.json()
}

// Mark a notification as read
export async function markAsRead(id: number): Promise<{ success: boolean }> {
  const response = await fetch(`${API_URL}/notifications/${id}/read`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    credentials: "include",
  })

  if (!response.ok) {
    throw new Error(`Failed to mark notification as read: ${response.status}`)
  }

  return response.json()
}

// Mark all notifications as read
export async function markAllAsRead(): Promise<{ success: boolean }> {
  const response = await fetch(`${API_URL}/notifications/read-all`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    credentials: "include",
  })

  if (!response.ok) {
    throw new Error(`Failed to mark all notifications as read: ${response.status}`)
  }

  return response.json()
}

// Delete a notification
export async function deleteNotification(id: number): Promise<{ success: boolean }> {
  const response = await fetch(`${API_URL}/notifications/${id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    credentials: "include",
  })

  if (!response.ok) {
    throw new Error(`Failed to delete notification: ${response.status}`)
  }

  return response.json()
}

// Generate test notifications (for demo purposes)
export async function generateTestNotifications(): Promise<{ message: string }> {
  const response = await fetch(`${API_URL}/notifications/generate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    credentials: "include",
  })

  if (!response.ok) {
    throw new Error(`Failed to generate test notifications: ${response.status}`)
  }

  return response.json()
}
