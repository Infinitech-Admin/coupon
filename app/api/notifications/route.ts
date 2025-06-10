import { type NextRequest, NextResponse } from "next/server"

export const dynamic = "force-dynamic"

// Mock database for notifications (in a real app, this would be a database)
let notificationsDb: any[] = [
  {
    id: 1,
    type: "coupon_expiry",
    title: "Coupons Expiring Soon",
    message: "5 coupons will expire within 24 hours",
    timestamp: new Date().toISOString(),
    read: false,
    priority: "high",
    data: { count: 5 },
  },
  {
    id: 2,
    type: "department_alert",
    title: "Department Performance Alert",
    message: "Marketing has a low claim rate of 65.5%",
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    read: false,
    priority: "medium",
    data: { claim_rate: 65.5 },
  },
  {
    id: 3,
    type: "achievement",
    title: "Perfect Performance!",
    message: "John Doe from Engineering has 100% claim rate!",
    timestamp: new Date(Date.now() - 7200000).toISOString(),
    read: true,
    priority: "low",
    data: { claim_rate: 100, total_coupons: 12 },
  },
]

// GET handler to fetch all notifications
export async function GET(request: NextRequest) {
  // In a real app, you would fetch from a database and filter by user
  return NextResponse.json({
    notifications: notificationsDb,
    unread_count: notificationsDb.filter((n) => !n.read).length,
  })
}

// POST handler to mark a notification as read
export async function POST(request: NextRequest) {
  const { id } = await request.json()

  if (!id) {
    return NextResponse.json({ error: "Notification ID is required" }, { status: 400 })
  }

  const notification = notificationsDb.find((n) => n.id === id)
  if (!notification) {
    return NextResponse.json({ error: "Notification not found" }, { status: 404 })
  }

  notification.read = true

  return NextResponse.json({ success: true })
}

// DELETE handler to delete a notification
export async function DELETE(request: NextRequest) {
  const { id } = await request.json()

  if (!id) {
    return NextResponse.json({ error: "Notification ID is required" }, { status: 400 })
  }

  const initialLength = notificationsDb.length
  notificationsDb = notificationsDb.filter((n) => n.id !== id)

  if (notificationsDb.length === initialLength) {
    return NextResponse.json({ error: "Notification not found" }, { status: 404 })
  }

  return NextResponse.json({ success: true })
}
