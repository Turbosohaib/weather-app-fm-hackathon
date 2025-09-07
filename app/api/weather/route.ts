import { NextRequest, NextResponse } from "next/server";

const CURRENT = "temperature_2m,apparent_temperature,relative_humidity_2m,precipitation,weather_code,wind_speed_10m,wind_direction_10m,is_day";
const HOURLY  = "temperature_2m,apparent_temperature,relative_humidity_2m,precipitation,precipitation_probability,weather_code,wind_speed_10m,wind_gusts_10m,wind_direction_10m";
const DAILY   = "weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,sunrise,sunset";

export async function GET(req: NextRequest) {
    const q = new URL(req.url).searchParams;

    const lat = q.get("lat"), lon = q.get("lon");
    if (!lat || !lon) return NextResponse.json({ error: "lat/lon required" }, { status: 400 });

    const tUnit = q.get("tUnit") ?? "celsius"; // celsius|fahrenheit
    const wUnit = q.get("wUnit") ?? "kmh";     // kmh|ms|mph|kn
    const pUnit = q.get("pUnit") ?? "mm";      // mm|inch
    const days  = q.get("days")  ?? "7";       // up to 16
    const tz    = q.get("tz")    ?? "auto";
    const cell   = q.get("cell")   ?? "land";
    const wantMinutely = q.get("minutely") === "1";

    const api = new URL("https://api.open-meteo.com/v1/forecast");
    api.searchParams.set("latitude", lat);
    api.searchParams.set("longitude", lon);
    api.searchParams.set("timezone", tz);
    api.searchParams.set("timeformat", "iso8601");
    api.searchParams.set("forecast_days", days);
    api.searchParams.set("current", CURRENT);
    api.searchParams.set("hourly", HOURLY);
    api.searchParams.set("daily", DAILY);
    api.searchParams.set("temperature_unit", tUnit);
    api.searchParams.set("wind_speed_unit", wUnit);
    api.searchParams.set("precipitation_unit", pUnit);
    api.searchParams.set("cell_selection", cell);

    if (wantMinutely) {
        api.searchParams.set("minutely_15", "temperature_2m,apparent_temperature,relative_humidity_2m,precipitation,weather_code,wind_speed_10m,wind_gusts_10m");
        // api.searchParams.set("forecast_minutely_15", "96"); // e.g., next 24h (optional)
    }

    // Optional passthroughs: start_date/end_date/start_hour/end_hour/forecast_hours/past_hours
    for (const k of ["start_date","end_date","start_hour","end_hour","forecast_hours","past_hours"])
        if (q.get(k)) api.searchParams.set(k, q.get(k)!);

    const r = await fetch(api, { next: { revalidate: 900 } }); // 15 min cache
    return NextResponse.json(await r.json());
}
