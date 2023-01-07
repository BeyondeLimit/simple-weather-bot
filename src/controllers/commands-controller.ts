import { Context, Markup, NarrowedContext } from "telegraf";
import { Update } from "typegram";
import { WeatherFindingService } from "../services/weather-finding-service";
import { Message } from "telegraf/typings/core/types/typegram";
import { BotInformationService } from "../services/bot-information-service";

export class CommandsController {

    private weatherFindingService = new WeatherFindingService();
    private botInformationService = new BotInformationService();

    public requestLocation = async (context: Context<Update>) => {
        context.reply(
            "Could you please share your location to show you the weather?)",
            Markup.keyboard([
                Markup.button.locationRequest("My location")
            ])
                .oneTime()
                .resize(),
        );
    }

    public getWeatherByLocation = async (context: NarrowedContext<Context<Update>, {
        message: (Update.New & Update.NonChannel & Message.LocationMessage) | (Update.New & Update.NonChannel & Message.VenueMessage);
        update_id: number;
    }>) => {
        console.log("User shared location");
        const response = await this.weatherFindingService.findWeaterInLocation(context.message?.location);
        context.reply(response, Markup.removeKeyboard());
    }

    public handleStart = async (context: Context<Update>) => {
        const message = this.botInformationService.getWelcomeText();
        context.reply(message);
    }
}