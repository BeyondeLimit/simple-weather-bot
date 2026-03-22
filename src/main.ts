import { CommandsController } from "./controllers/commands-controller";
import { Telegraf } from "telegraf";

import { BOT_TOKEN } from "./utils/config";
import { handleBotError } from "./utils/bot-error-handler";

const bot = new Telegraf(BOT_TOKEN as string);

const controller = new CommandsController();

bot.catch(handleBotError);

bot.start(controller.handleStart);

bot.command("weather", controller.requestLocation);

bot.command("gemini", controller.getTodaysMarketSuggestion);
bot.command("today", controller.getGroqTodayMessage);
bot.command("etf", controller.getGroqSpecificQuestionMessage);

void bot.launch().catch((err) => {
    console.error("Failed to start bot:", err);
    process.exit(1);
});

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));

process.on("unhandledRejection", (reason, promise) => {
    console.error("Unhandled rejection at:", promise, "reason:", reason);
});