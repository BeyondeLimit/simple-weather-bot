import type { Context } from "telegraf";

const USER_FACING_ERROR =
    "Something went wrong while processing your request. Please try again in a moment.";

/**
 * Telegraf default handler rethrows and sets process.exitCode — replace with this so the bot keeps running.
 */
export async function handleBotError(err: unknown, ctx: Context): Promise<void> {
    console.error("Bot handler error:", err);
    try {
        await ctx.reply(USER_FACING_ERROR);
    } catch (sendErr) {
        console.error("Could not send error message to chat:", sendErr);
    }
}
