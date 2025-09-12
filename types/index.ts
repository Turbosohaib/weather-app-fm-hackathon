/* ------------ Types ------------ */

export type Place = {
  id?: number;
  name: string;
  country?: string;
  admin1?: string;
  latitude: number;
  longitude: number;
  timezone?: string;
};

export type CurrentUnits = {
  time: 'iso8601';
  interval: 'seconds';
  temperature_2m: string;
  apparent_temperature: string;
  relative_humidity_2m: string;
  precipitation: string;
  weather_code: string; // "wmo code"
  wind_speed_10m: string;
  wind_direction_10m: string;
  is_day: string;
};

export type CurrentBlock = {
  time: string; // ISO
  interval: number;
  temperature_2m: number;
  apparent_temperature: number;
  relative_humidity_2m: number;
  precipitation: number;
  weather_code: number;
  wind_speed_10m: number;
  wind_direction_10m: number;
  is_day: 0 | 1;
};

export type HourlyUnits = {
  time: 'iso8601';
  temperature_2m: string;
  apparent_temperature: string;
  relative_humidity_2m: string;
  precipitation: string;
  precipitation_probability: string;
  weather_code: string; // "wmo code"
  wind_speed_10m: string;
  wind_gusts_10m: string;
  wind_direction_10m: string;
};

export type HourlyBlock = {
  time: string[];
  temperature_2m: number[];
  apparent_temperature: number[];
  relative_humidity_2m: number[];
  precipitation: number[];
  precipitation_probability: number[];
  weather_code: number[];
  wind_speed_10m: number[];
  wind_gusts_10m: number[];
  wind_direction_10m: number[];
};

export type DailyUnits = {
  time: 'iso8601';
  weather_code: string; // "wmo code"
  temperature_2m_max: string;
  temperature_2m_min: string;
  precipitation_sum: string;
  precipitation_probability_max: string;
  sunrise: 'iso8601';
  sunset: 'iso8601';
};

export type DailyBlock = {
  time: string[];
  weather_code: number[];
  temperature_2m_max: number[];
  temperature_2m_min: number[];
  precipitation_sum: number[];
  precipitation_probability_max: number[];
  sunrise: string[];
  sunset: string[];
};

export type Weather = {
  latitude: number;
  longitude: number;
  generationtime_ms: number;
  utc_offset_seconds: number;
  timezone: string;
  timezone_abbreviation: string;
  elevation: number;
  current_units: CurrentUnits;
  current: CurrentBlock;
  hourly_units: HourlyUnits;
  hourly: HourlyBlock;
  daily_units: DailyUnits;
  daily: DailyBlock;
};
