import axios from 'axios';
import { API_ENDPOINT } from '../utils/config';
import { Location } from "telegraf/typings/core/types/typegram";
import { IWeatherResponse } from '../../models/i-weather-response';


export class APIOneCallWeather {

    public getCopenhagenWeather = async (location: Location) => {
        try {
            const url = API_ENDPOINT;
            if (url == undefined) {
                console.log("URl was undefined");
                return "Missing URL from environment";
            }

            const { data, status } = await axios.get<IWeatherResponse>(
                url,
                {
                    params: {
                        latitude: location.latitude,//55.676098,
                        longitude: location.longitude,//12.568337,
                        current_weather: true,
                        daily: "temperature_2m_max,temperature_2m_min",
                        timezone: "Europe/Berlin",
                    },
                }
            );
            console.log(data);
            console.log(status);
            return data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                console.log(error.message);
                return error.message;
            } else {
                console.log("unknown error");
                return "Unknown error occured";
            }
        }
    };
}
