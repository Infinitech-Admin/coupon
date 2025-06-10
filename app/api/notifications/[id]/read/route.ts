import { NextRequest, NextResponse } from 'next/server';

// Mock database for notifications (in a real app, this would be a database)
// This is just for demo purposes - in a real app, you'd use a proper database
let notificationsDb: any[] = [
  {
    id: 1,
    type: 'coupon_expiry',
    title: 'Coupons Expiring Soon',
    message: '5 coupons will expire within 24 hours',
    timestamp: new Date().toISOString(),
    read: false,
    priority: 'high',
    data: { count: 5 }
  },
  {
    id: 2,
    type: 'department_alert',
    title: 'Department Performance Alert',
    message: 'Marketing has a low claim rate of 65.5%',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    read: false,
    priority: 'medium',
    data: { claim_rate: 65.5 }
  },
  {
    id: 3,
    type: 'achievement',
    title: 'Perfect Performance!',
    message: 'John Doe from Engineering has 100% claim rate!',
    timestamp: new Date(Date.now() - 7200000).toISOString(),
    read: true,
    priority: 'low',
    data: { claim_rate: 100, total_coupons: 12 }
  }
];

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = parseInt(params.id, 10);
  
  if (isNaN(id)) {
    return NextResponse.json({ error: 'Invalid notification ID' }, { status: 400 });
  }
  
  const notification = notificationsDb.find(n => n.id === id);
  if (!notification) {
    return NextResponse.json({ error: 'Notification not found' }, { status: 404 });
  }
  
  notification.read = true;
  
  return NextResponse.json({ success: true });
}
