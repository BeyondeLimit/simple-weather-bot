import type { Update } from "@telegraf/types";
import { Context, Markup, NarrowedContext } from "telegraf";
import { WeatherFindingService } from "../services/weather-finding-service";
import { Message } from "telegraf/typings/core/types/typegram";
import { BotInformationService } from "../services/bot-information-service";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { GroqService } from "../services/groq-service";
import { buildTelegramMarketPrompt } from "../prompts/telegram-llm-prompt";
import { replyTelegramHtml } from "../utils/reply-telegram-html";

export class CommandsController {

    private weatherFindingService = new WeatherFindingService();
    private botInformationService = new BotInformationService();
    private groqService = new GroqService();

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

    public getTodaysMarketSuggestion = async (ctx: Context<Update>) => {
        const args = ctx.text?.replace(/^\/gemini(@\S+)?\s*/i, "").trim() ?? "";
        const prompt = buildTelegramMarketPrompt(
            args.length > 0
                ? args
                : "Brief overview: looking at today's stock market, which broad ETFs look strongest on the session? If markets are closed, use the last session and say so.",
        );

        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        const result = await model.generateContent(prompt);
        const text = result.response.text();

        await replyTelegramHtml(ctx, text, Markup.removeKeyboard());
    }

    public getGroqTodayMessage = async (ctx: Context<Update>) => {
        const prompt = buildTelegramMarketPrompt(
            "Looking at today's stock market, which ETF has the best performance so far today? If it is a weekend, use the last day the market was open and state that clearly.",
        );
        const response = await this.groqService.getWelcomeMessage(prompt);
        await replyTelegramHtml(ctx, response);
    }

    public getGroqSpecificQuestionMessage = async (ctx: Context<Update>) => {
        const args = ctx.text?.replace(/^\/etf(@\S+)?\s*/i, "").trim() ?? "";

        if (args.length === 0) {
            await ctx.reply(
                "Add your question after the command, e.g. <code>/etf Should I buy VOO?</code>",
                { parse_mode: "HTML" },
            );
            return;
        }

        const prompt = buildTelegramMarketPrompt(args);
        const response = await this.groqService.getWelcomeMessage(prompt);
        await replyTelegramHtml(ctx, response);
    }
}
