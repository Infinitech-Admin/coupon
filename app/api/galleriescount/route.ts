import { NextResponse } from "next/server";

export async function GET() {
  try {
    const laravelUrl = process.env.LARAVEL_API_URL || "http://127.0.0.1:8000";

    const response = await fetch(`${laravelUrl}/api/galleriescount`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Laravel API Error:", errorText);
      return NextResponse.json({ total: 42 }); // Fallback
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error proxying to Laravel:", error);
    return NextResponse.json({ total: 42 }); // Fallback
  }
}
