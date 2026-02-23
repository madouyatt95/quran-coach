export type WeatherEvent = 'rain' | 'thunderstorm' | 'wind' | 'none';

export interface WeatherCondition {
    event: WeatherEvent;
    windSpeedKmH: number;
    codeWMO: number;
    isNight: boolean;
}

/**
 * Mapping of WMO Weather interpretation codes
 * Source: https://open-meteo.com/en/docs
 */
function determineWeatherEvent(code: number, windSpeed: number): WeatherEvent {
    // 1. Wind priority (Very high wind > 40 km/h)
    // Note: Prophet Muhammad (pbuh) made specific duas for strong winds
    if (windSpeed > 40) {
        return 'wind';
    }

    // 2. Thunderstorm (codes 95, 96, 99)
    if (code >= 95 && code <= 99) {
        return 'thunderstorm';
    }

    // 3. Rain / Drizzle / Showers (codes 51-67, 80-82)
    const isRaining = (code >= 51 && code <= 67) || (code >= 80 && code <= 82);
    if (isRaining) {
        return 'rain';
    }

    return 'none';
}

/**
 * Fetch current weather from Open-Meteo using lat/lng
 */
export async function getCurrentWeather(lat: number, lng: number): Promise<WeatherCondition> {
    try {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=weather_code,wind_speed_10m,is_day&timezone=auto`;
        const res = await fetch(url);
        if (!res.ok) throw new Error('Weather API error');

        const data = await res.json();

        if (!data.current) throw new Error('No current weather data');

        const current = data.current;
        const codeWMO = current.weather_code;
        const windSpeedKmH = current.wind_speed_10m;
        const isNight = current.is_day === 0;

        const event = determineWeatherEvent(codeWMO, windSpeedKmH);

        return {
            event,
            windSpeedKmH,
            codeWMO,
            isNight
        };
    } catch (error) {
        console.error('[WeatherService] Failed to fetch weather:', error);
        return { event: 'none', windSpeedKmH: 0, codeWMO: 0, isNight: false };
    }
}
