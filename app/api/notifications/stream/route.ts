import { NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  // Create a new readable stream
  const stream = new ReadableStream({
    async start(controller) {
      // Function to send SSE data
      const sendEvent = (data: any) => {
        controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify(data)}\n\n`));
      };

      // Keep the connection alive with a ping every 30 seconds
      const pingInterval = setInterval(() => {
        controller.enqueue(new TextEncoder().encode(": ping\n\n"));
      }, 30000);

      // Proxy the SSE connection to your Laravel backend
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
        const response = await fetch(`${apiUrl}/notifications/stream`, {
          headers: {
            'Accept': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
            // Forward any auth cookies or headers
            ...Object.fromEntries(request.headers)
          },
        });

        if (!response.ok || !response.body) {
          throw new Error(`Failed to connect to notification stream: ${response.status}`);
        }

        const reader = response.body.getReader();

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            
            // Forward the chunk directly to the client
            controller.enqueue(value);
          }
        } catch (error) {
          console.error('Error reading from SSE stream:', error);
        } finally {
          reader.releaseLock();
        }
      } catch (error) {
        console.error('Error setting up SSE connection:', error);
        
        // If we can't connect to the backend, simulate some notifications
        // This is just for demo purposes
        const mockNotifications = [
          {
            id: Date.now(),
            type: 'coupon_expiry',
            title: 'Coupons Expiring Soon',
            message: '5 coupons will expire within 24 hours',
            timestamp: new Date().toISOString(),
            read: false,
            priority: 'high',
            data: { count: 5 }
          }
        ];
        
        sendEvent(mockNotifications);
      } finally {
        clearInterval(pingInterval);
      }
    }
  });

  // Return the stream with appropriate headers for SSE
  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}
