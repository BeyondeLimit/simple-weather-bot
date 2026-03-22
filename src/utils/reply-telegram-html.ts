import type { Context } from "telegraf";

type ReplyExtra = Omit<NonNullable<Parameters<Context["reply"]>[1]>, "parse_mode">;

/**
 * Reply with Telegram HTML. If the API rejects markup (invalid HTML), fall back to plain text.
 */
export async function replyTelegramHtml(
    ctx: Context,
    html: string,
    extra?: ReplyExtra,
): Promise<void> {
    try {
        await ctx.reply(html, { parse_mode: "HTML", ...extra });
    } catch (err) {
        console.warn("replyTelegramHtml: HTML parse failed, sending plain text", err);
        const plain = html.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
        await ctx.reply(plain.length > 0 ? plain : "Could not send formatted reply.");
    }
}
