import { IWeatherResponse } from "../../models/i-weather-response";
import { APIOneCallWeather } from "../api/api-one-call";
import { Location } from "telegraf/typings/core/types/typegram";


export class WeatherFindingService {

    private weatherAPI = new APIOneCallWeather();

    public findWeaterInLocation = async (location: Location): Promise<string> => {
        const json = await this.weatherAPI.getCopenhagenWeather(location);
        const weather: IWeatherResponse = json as IWeatherResponse;

        const temperature = weather.current_weather.temperature;
        const dailyUnits = weather.daily_units.temperature_2m_max;
        const time = weather.current_weather.time.split('T')[1];
        
        const formatter = new Intl.DateTimeFormat('en', { month: 'short' });
        const forecast = weather.daily.time.map((item, index) => {
            const date = new Date(item).toDateString();
            return `\nDate: ${date}, min: ${weather.daily.temperature_2m_min[index]}${dailyUnits} max: ${weather.daily.temperature_2m_max[index]}${dailyUnits}`;
        });

        const initialMessage = `
        Currently your weather is: ${temperature} ${dailyUnits} \nAt ${time} o'clock.

Weather forecast for upcomming ${weather.daily.time.length} days is:
        `;
        return initialMessage + forecast;
    };
}