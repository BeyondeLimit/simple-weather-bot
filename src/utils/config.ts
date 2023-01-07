import * as dotenv from "dotenv";

dotenv.config();

let path = "./config/.env";

dotenv.config({path: path});

export const API_ENDPOINT = process.env.API_ENDPOINT_WEATHER;
export const API_KEY = process.env.API_KEY;
export const BOT_TOKEN = process.env.BOT_TOKEN;