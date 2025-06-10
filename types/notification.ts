export interface Notification {
  id: number
  type: string
  title: string
  message: string
  data: any
  read: boolean
  timestamp: string
  priority: "high" | "medium" | "low"
  employee_id?: number
  department?: string
}
