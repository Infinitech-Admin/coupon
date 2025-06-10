import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get("lat");
  const lon = searchParams.get("lon");
  const apiKey = "cae01b010c6041e9a7311410252205";

  if (!lat || !lon) {
    return NextResponse.json({ error: "Missing coordinates" }, { status: 400 });
  }

  try {
    const response = await fetch(
      `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${lat},${lon}&days=4&aqi=no&alerts=no`,
    );
    const text = await response.text();
    console.log("Weather API raw response:", text);

    if (!response.ok) {
      return NextResponse.json(
        {
          error: `WeatherAPI error: ${response.status} ${response.statusText}`,
          details: text,
        },
        { status: response.status },
      );
    }

    if (!text) {
      return NextResponse.json(
        { error: "Empty response from WeatherAPI" },
        { status: 500 },
      );
    }

    const data = JSON.parse(text);

    if (!data.current || !data.forecast) {
      return NextResponse.json(
        { error: "Missing weather data (current or forecast)" },
        { status: 500 },
      );
    }

    return NextResponse.json(data);
  } catch (error: unknown) {
    console.error("Weather API fetch error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    );
  }
}
