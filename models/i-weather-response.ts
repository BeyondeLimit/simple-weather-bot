export interface IWeatherResponse {
    latitude: number;
    longitude: number;
    generationtime_ms: number;
    utc_offset_seconds: number;
    timezone: string;
    timezone_abbreviation: string;
    elevation: number;
    current_weather: ICurrentWeather;
    daily_units: IDailyUnits;
    daily: IDaily;
}

export interface ICurrentWeather {
    temperature: number;
    windspeed: number;
    winddirection: number;
    weathercode: number;
    time: string;
}

export interface IDaily {
    time: Date[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
}

export interface IDailyUnits {
    time: string;
    temperature_2m_max: string;
    temperature_2m_min: string;
}