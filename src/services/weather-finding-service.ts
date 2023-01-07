import { APIOneCallWeather, IWeatherResponse } from "../api/api-one-call";
import { Location } from "telegraf/typings/core/types/typegram";


export class WeatherFindingService {

    private weatherAPI = new APIOneCallWeather();

    public findWeaterInLocation = async (location: Location): Promise<string> => {
        const json = await this.weatherAPI.getCopenhagenWeather(location);
        const weather: IWeatherResponse = json as IWeatherResponse;

        const temperature = weather.current_weather.temperature;
        const dailyUnits = weather.daily_units.temperature_2m_max;
        const time = weather.current_weather.time.split('T')[1];

        return `Currently your weather is: ${temperature} ${dailyUnits} \nAt ${time} o'clock`;
    };
}