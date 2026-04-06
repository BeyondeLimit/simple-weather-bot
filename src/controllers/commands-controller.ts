import type { Update } from "@telegraf/types";
import { Context, Markup, NarrowedContext } from "telegraf";
import { WeatherFindingService } from "../services/weather-finding-service";
import { Message } from "telegraf/typings/core/types/typegram";
import { BotInformationService } from "../services/bot-information-service";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { GroqService } from "../services/groq-service";
import { buildTelegramMarketPrompt } from "../prompts/telegram-llm-prompt";
import { replyTelegramHtml } from "../utils/reply-telegram-html";
import { PromptsService } from "../services/prompts-service";

export class CommandsController {

    private weatherFindingService = new WeatherFindingService();
    private botInformationService = new BotInformationService();
    private groqService = new GroqService();
    private promptsService: PromptsService;

    constructor(promptsService: PromptsService) {
        this.promptsService = promptsService;
    }

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

    public savePrompt = async (ctx: Context<Update>) => {
        const userId = String(ctx.from?.id);
        const args = ctx.text?.replace(/^\/save(@\S+)?\s*/i, "").trim() ?? "";
        if (args.length === 0) {
            await ctx.reply("Usage: <code>/save VOO</code>", { parse_mode: "HTML" });
            return;
        }
        const saved = await this.promptsService.savePrompt(userId, args);
        const name = args.toUpperCase();
        await ctx.reply(
            saved ? `Saved <code>${name}</code>.` : `<code>${name}</code> is already in your list.`,
            { parse_mode: "HTML" },
        );
    };

    public listPrompts = async (ctx: Context<Update>) => {
        const userId = String(ctx.from?.id);
        const prompts = await this.promptsService.listPrompts(userId);
        if (prompts.length === 0) {
            await ctx.reply("Your list is empty. Use /save to add ETFs.");
            return;
        }
        const buttons = prompts.map((p) => [Markup.button.callback(p, `etf:${p}`)]);
        await ctx.reply("Your saved ETFs — tap one to analyse:", Markup.inlineKeyboard(buttons));
    };

    public deleteMenu = async (ctx: Context<Update>) => {
        const userId = String(ctx.from?.id);
        const prompts = await this.promptsService.listPrompts(userId);
        if (prompts.length === 0) {
            await ctx.reply("Your list is empty.");
            return;
        }
        const buttons = prompts.map((p) => [Markup.button.callback(p, `del:${p}`)]);
        await ctx.reply("Tap an ETF to delete it:", Markup.inlineKeyboard(buttons));
    };

    public handleEtfAction = async (ctx: Context<Update>) => {
        await ctx.answerCbQuery();
        const data = (ctx.callbackQuery as { data?: string })?.data ?? "";
        const etfName = data.replace(/^etf:/, "");
        const prompt = buildTelegramMarketPrompt(etfName);
        const response = await this.groqService.getWelcomeMessage(prompt);
        await replyTelegramHtml(ctx, response);
    };

    public handleDeleteAction = async (ctx: Context<Update>) => {
        const data = (ctx.callbackQuery as { data?: string })?.data ?? "";
        const etfName = data.replace(/^del:/, "");
        await ctx.answerCbQuery();
        const userId = String(ctx.from?.id);
        const deleted = await this.promptsService.deletePrompt(userId, etfName);
        await ctx.editMessageText(
            deleted ? `Deleted <code>${etfName}</code>.` : `<code>${etfName}</code> not found.`,
            { parse_mode: "HTML" },
        );
    };
}
