import { NextResponse } from "next/server"

// Mock database for notifications (in a real app, this would be a database)
// This is just for demo purposes - in a real app, you'd use a proper database
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

// Define notification types
interface GeneratedNotification {
  type: "coupon_expiry" | "department_alert" | "achievement" | "system_update"
  title: string
  message: string
  priority: "high" | "medium" | "low"
   data?: Record<string, string | number | boolean | undefined>; // Allow undefined
}

// Predefined notification templates for generation
const notificationTemplates = {
  coupon_expiry: [
    {
      title: "Coupons Expiring Soon",
      message: "12 coupons will expire within 24 hours",
      priority: "high" as const,
      data: { count: 12 },
    },
    {
      title: "Urgent: Coupons Expiring Today",
      message: "8 coupons expire at midnight today",
      priority: "high" as const,
      data: { count: 8 },
    },
    {
      title: "Weekly Expiry Alert",
      message: "25 coupons will expire this week",
      priority: "medium" as const,
      data: { count: 25 },
    },
  ],
  department_alert: [
    {
      title: "Department Performance Alert",
      message: "Sales department has a low claim rate of 58.3%",
      priority: "medium" as const,
      data: { claim_rate: 58.3, department: "Sales" },
    },
    {
      title: "Low Engagement Warning",
      message: "HR department claim rate dropped to 45.2%",
      priority: "high" as const,
      data: { claim_rate: 45.2, department: "HR" },
    },
    {
      title: "Department Review Needed",
      message: "Finance department showing declining coupon usage",
      priority: "medium" as const,
      data: { department: "Finance" },
    },
  ],
  achievement: [
    {
      title: "Perfect Performance!",
      message: "Sarah Johnson from Marketing has 100% claim rate!",
      priority: "low" as const,
      data: { claim_rate: 100, employee: "Sarah Johnson", department: "Marketing" },
    },
    {
      title: "Top Performer Alert",
      message: "Mike Chen from Engineering achieved 95% claim rate",
      priority: "low" as const,
      data: { claim_rate: 95, employee: "Mike Chen", department: "Engineering" },
    },
    {
      title: "Monthly Champion",
      message: "Lisa Wang leads with highest coupon usage this month",
      priority: "low" as const,
      data: { employee: "Lisa Wang" },
    },
  ],
  system_update: [
    {
      title: "System Maintenance Scheduled",
      message: "Coupon system will be offline for maintenance on Sunday 2AM-4AM",
      priority: "medium" as const,
      data: { maintenance_window: "Sunday 2AM-4AM" },
    },
    {
      title: "New Feature Available",
      message: "Mobile app now supports QR code scanning for faster redemption",
      priority: "low" as const,
      data: { feature: "QR scanning" },
    },
    {
      title: "Security Update",
      message: "Enhanced security measures have been implemented",
      priority: "medium" as const,
      data: { update_type: "security" },
    },
  ],
}

function generateRandomNotifications(count = 3): GeneratedNotification[] {
  const types = Object.keys(notificationTemplates) as Array<keyof typeof notificationTemplates>
  const notifications: GeneratedNotification[] = []

  for (let i = 0; i < count; i++) {
    // Pick a random type
    const randomType = types[Math.floor(Math.random() * types.length)]
    const templates = notificationTemplates[randomType]

    // Pick a random template from that type
    const randomTemplate = templates[Math.floor(Math.random() * templates.length)]

    notifications.push({
      type: randomType,
      ...randomTemplate,
    })
  }

  return notifications
}

export async function POST() {
  try {
    // Generate random notifications from templates
    const generatedNotifications = generateRandomNotifications(3)

    // Add the generated notifications to our mock database
    const newNotifications = generatedNotifications.map((notification: GeneratedNotification, index: number) => ({
      id: notificationsDb.length + index + 1,
      ...notification,
      timestamp: new Date().toISOString(),
      read: false,
    }))

    notificationsDb = [...newNotifications, ...notificationsDb]

    return NextResponse.json({
      message: "Notifications generated successfully",
      count: newNotifications.length,
      notifications: newNotifications,
    })
  } catch (error) {
    console.error("Error generating notifications:", error)
    return NextResponse.json({ error: "Failed to generate notifications" }, { status: 500 })
  }
}
