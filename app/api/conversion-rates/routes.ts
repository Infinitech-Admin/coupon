import { NextResponse } from "next/server";

export async function GET() {
  try {
    // This will proxy the request to your Laravel backend
    const laravelUrl = process.env.LARAVEL_API_URL || "http://127.0.0.1:8000";
    const response = await fetch(`${laravelUrl}/api/conversion-rates`, {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });

    // If Laravel returns an error, log it and return mock data
    if (!response.ok) {
      const errorText = await response.text();
      console.error("Laravel API Error:", errorText);

      // Return mock data as fallback
      return NextResponse.json({
        inquiryToAppointment: 32,
        inquiries: 320,
        appointments: 102,
      });
    }

    // Forward the Laravel response
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error proxying to Laravel:", error);

    // Return mock data on error
    return NextResponse.json({
      inquiryToAppointment: 32,
      inquiries: 320,
      appointments: 102,
    });
  }
}
