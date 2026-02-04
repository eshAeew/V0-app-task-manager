import { NextRequest, NextResponse } from "next/server";

interface WeatherData {
  current: {
    temp: number;
    condition: string;
    icon: string;
    humidity: number;
    windSpeed: number;
    precipitation: number;
    feelsLike: number;
    uvIndex: number;
    visibility: number;
    pressure: number;
    isDay: boolean;
  };
  hourly: Array<{
    time: string;
    temp: number;
  }>;
  daily: Array<{
    date: string;
    day: string;
    tempMax: number;
    tempMin: number;
    condition: string;
    icon: string;
  }>;
  location: {
    city: string;
    timezone: string;
  };
}

function getWeatherCondition(code: number, isDay: boolean): { condition: string; icon: string } {
  // WMO Weather interpretation codes
  const conditions: Record<number, { condition: string; dayIcon: string; nightIcon: string }> = {
    0: { condition: "Clear", dayIcon: "sun", nightIcon: "moon" },
    1: { condition: "Mainly Clear", dayIcon: "sun", nightIcon: "moon" },
    2: { condition: "Partly Cloudy", dayIcon: "cloud-sun", nightIcon: "cloud-moon" },
    3: { condition: "Overcast", dayIcon: "cloud", nightIcon: "cloud" },
    45: { condition: "Foggy", dayIcon: "cloud-fog", nightIcon: "cloud-fog" },
    48: { condition: "Rime Fog", dayIcon: "cloud-fog", nightIcon: "cloud-fog" },
    51: { condition: "Light Drizzle", dayIcon: "cloud-drizzle", nightIcon: "cloud-drizzle" },
    53: { condition: "Moderate Drizzle", dayIcon: "cloud-drizzle", nightIcon: "cloud-drizzle" },
    55: { condition: "Dense Drizzle", dayIcon: "cloud-drizzle", nightIcon: "cloud-drizzle" },
    61: { condition: "Slight Rain", dayIcon: "cloud-rain", nightIcon: "cloud-rain" },
    63: { condition: "Moderate Rain", dayIcon: "cloud-rain", nightIcon: "cloud-rain" },
    65: { condition: "Heavy Rain", dayIcon: "cloud-rain", nightIcon: "cloud-rain" },
    71: { condition: "Slight Snow", dayIcon: "cloud-snow", nightIcon: "cloud-snow" },
    73: { condition: "Moderate Snow", dayIcon: "cloud-snow", nightIcon: "cloud-snow" },
    75: { condition: "Heavy Snow", dayIcon: "cloud-snow", nightIcon: "cloud-snow" },
    80: { condition: "Slight Showers", dayIcon: "cloud-rain", nightIcon: "cloud-rain" },
    81: { condition: "Moderate Showers", dayIcon: "cloud-rain", nightIcon: "cloud-rain" },
    82: { condition: "Violent Showers", dayIcon: "cloud-rain", nightIcon: "cloud-rain" },
    95: { condition: "Thunderstorm", dayIcon: "cloud-lightning", nightIcon: "cloud-lightning" },
    96: { condition: "Thunderstorm with Hail", dayIcon: "cloud-lightning", nightIcon: "cloud-lightning" },
    99: { condition: "Severe Thunderstorm", dayIcon: "cloud-lightning", nightIcon: "cloud-lightning" },
  };

  const weatherInfo = conditions[code] || conditions[0];
  return {
    condition: weatherInfo.condition,
    icon: isDay ? weatherInfo.dayIcon : weatherInfo.nightIcon,
  };
}

function getDayName(dateStr: string): string {
  const date = new Date(dateStr);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  if (date.toDateString() === today.toDateString()) return "Today";
  if (date.toDateString() === tomorrow.toDateString()) return "Tomorrow";
  
  return date.toLocaleDateString("en-US", { weekday: "short" });
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const lat = searchParams.get("lat");
  const lng = searchParams.get("lng");

  console.log("[v0] Weather API called with lat:", lat, "lng:", lng);

  if (!lat || !lng) {
    return NextResponse.json({ error: "Latitude and longitude are required" }, { status: 400 });
  }

  try {
    // Fetch weather data from Open-Meteo API (free, no API key required)
    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m,is_day&hourly=temperature_2m&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto&forecast_days=8`;
    
    console.log("[v0] Fetching from Open-Meteo:", weatherUrl);
    
    const weatherResponse = await fetch(weatherUrl, {
      headers: {
        "Accept": "application/json",
      },
    });
    
    console.log("[v0] Open-Meteo response status:", weatherResponse.status);
    
    if (!weatherResponse.ok) {
      const errorText = await weatherResponse.text();
      console.error("[v0] Open-Meteo error:", errorText);
      throw new Error(`Weather API error: ${weatherResponse.status}`);
    }
    
    const weatherData = await weatherResponse.json();
    console.log("[v0] Weather data received, timezone:", weatherData.timezone);

    // Get city name from reverse geocoding
    let cityName = "Your Location";
    try {
      const geoUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=10&addressdetails=1`;
      const geoResponse = await fetch(geoUrl, {
        headers: {
          "User-Agent": "TaskManagerApp/1.0 (contact@example.com)",
          "Accept": "application/json",
        },
      });
      if (geoResponse.ok) {
        const geoData = await geoResponse.json();
        cityName = geoData.address?.city || 
                   geoData.address?.town || 
                   geoData.address?.village || 
                   geoData.address?.municipality ||
                   geoData.address?.county ||
                   geoData.address?.state ||
                   "Your Location";
        console.log("[v0] City name resolved:", cityName);
      }
    } catch (e) {
      console.error("[v0] Geocoding error:", e);
    }

    const isDay = weatherData.current?.is_day === 1;
    const weatherCode = weatherData.current?.weather_code ?? 0;
    const currentWeather = getWeatherCondition(weatherCode, isDay);

    // Process hourly data (next 24 hours)
    const hourlyTimes = weatherData.hourly?.time || [];
    const hourlyTemps = weatherData.hourly?.temperature_2m || [];
    
    // Find current hour index
    const now = new Date();
    const currentHourStr = now.toISOString().slice(0, 13);
    let startIndex = hourlyTimes.findIndex((t: string) => t.startsWith(currentHourStr));
    if (startIndex === -1) startIndex = 0;
    
    const hourlyData = hourlyTimes
      .slice(startIndex, startIndex + 24)
      .map((time: string, index: number) => ({
        time: new Date(time).toLocaleTimeString("en-US", { hour: "numeric", hour12: true }),
        temp: Math.round(hourlyTemps[startIndex + index] ?? 0),
      }));

    // Process daily data (7 days)
    const dailyTimes = weatherData.daily?.time || [];
    const dailyMaxTemps = weatherData.daily?.temperature_2m_max || [];
    const dailyMinTemps = weatherData.daily?.temperature_2m_min || [];
    const dailyWeatherCodes = weatherData.daily?.weather_code || [];
    
    const dailyData = dailyTimes.slice(0, 8).map((date: string, index: number) => {
      const dayWeather = getWeatherCondition(dailyWeatherCodes[index] ?? 0, true);
      return {
        date,
        day: getDayName(date),
        tempMax: Math.round(dailyMaxTemps[index] ?? 0),
        tempMin: Math.round(dailyMinTemps[index] ?? 0),
        condition: dayWeather.condition,
        icon: dayWeather.icon,
      };
    });

    const data: WeatherData = {
      current: {
        temp: Math.round(weatherData.current?.temperature_2m ?? 0),
        condition: currentWeather.condition,
        icon: currentWeather.icon,
        humidity: weatherData.current?.relative_humidity_2m ?? 0,
        windSpeed: Math.round(weatherData.current?.wind_speed_10m ?? 0),
        precipitation: Math.round(weatherData.current?.precipitation ?? 0),
        feelsLike: Math.round(weatherData.current?.apparent_temperature ?? 0),
        uvIndex: 0,
        visibility: 10,
        pressure: 1013,
        isDay,
      },
      hourly: hourlyData,
      daily: dailyData,
      location: {
        city: cityName,
        timezone: weatherData.timezone || "UTC",
      },
    };

    console.log("[v0] Returning weather data for:", cityName);
    return NextResponse.json(data);
  } catch (error) {
    console.error("[v0] Weather API error:", error);
    return NextResponse.json({ error: "Failed to fetch weather data" }, { status: 500 });
  }
}
