import { CommandsController } from "./controllers/commands-controller";
import { Telegraf } from "telegraf";

import { BOT_TOKEN } from "./utils/config";

const bot = new Telegraf(BOT_TOKEN as string);

const controller = new CommandsController();

bot.start(controller.handleStart);

bot.command("weather", controller.requestLocation);

bot.on("location", controller.getWeatherByLocation);

bot.launch();

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));