// lib/open-meteo.ts
export type Units =
    | { label: "metric";  t: "celsius";    w: "kmh"; p: "mm" }
    | { label: "imperial"; t: "fahrenheit"; w: "mph"; p: "inch" };

export const METRIC: Units =  { label: "metric",  t: "celsius",    w: "kmh", p: "mm" };
export const IMPERIAL: Units = { label: "imperial", t: "fahrenheit", w: "mph", p: "inch" };

export const getWeather = async (lat: number, lon: number, u: Units = METRIC, days = 7) => {
    const qs = new URLSearchParams({
        lat: String(lat), lon: String(lon),
        tUnit: u.t, wUnit: u.w, pUnit: u.p,
        days: String(days), tz: "auto"
    });
    const res = await fetch(`/api/weather?${qs.toString()}`);
    return res.json();
};

export const searchCities = async (q: string, lang = "en") =>
    (await (await fetch(`/api/geocode?q=${encodeURIComponent(q)}&lang=${lang}`)).json()) as { results?: any[] };

export const reverseCity = async (lat: number, lon: number, lang = "en") =>
    (await (await fetch(`/api/reverse-geocode?lat=${lat}&lon=${lon}&lang=${lang}`)).json()) as { results?: any[] };
