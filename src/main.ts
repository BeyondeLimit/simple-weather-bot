import { CommandsController } from "./controllers/commands-controller";
import { Telegraf } from "telegraf";

import { BOT_TOKEN } from "./utils/config";
import { handleBotError } from "./utils/bot-error-handler";
import { connectDatabase } from "./utils/db";
import { PromptsService } from "./services/prompts-service";

const bot = new Telegraf(BOT_TOKEN as string);

const promptsService = new PromptsService();
const controller = new CommandsController(promptsService);

bot.catch(handleBotError);

bot.start(controller.handleStart);

bot.command("weather", controller.requestLocation);

bot.command("gemini", controller.getTodaysMarketSuggestion);
bot.command("today", controller.getGroqTodayMessage);
bot.command("etf", controller.getGroqSpecificQuestionMessage);

bot.command("save", controller.savePrompt);
bot.command("list", controller.listPrompts);
bot.command("delete", controller.deleteMenu);

bot.action(/^etf:(.+)$/, controller.handleEtfAction);
bot.action(/^del:(.+)$/, controller.handleDeleteAction);

connectDatabase()
    .then(() => bot.launch())
    .catch((err) => {
        console.error("Startup failed:", err);
        process.exit(1);
    });

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));

process.on("unhandledRejection", (reason, promise) => {
    console.error("Unhandled rejection at:", promise, "reason:", reason);
});
