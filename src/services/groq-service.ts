import Groq from "groq-sdk";

/** Groq rejects very large JSON bodies (413). Keep prompts within a safe size. */
const MAX_PROMPT_CHARS = 12_000;

export class GroqService {
    private groqAPI = new Groq({ apiKey: process.env.GROQ_API_KEY });

    public getWelcomeMessage = async (prompt: string) => {
        const body =
            prompt.length > MAX_PROMPT_CHARS
                ? prompt.slice(0, MAX_PROMPT_CHARS)
                : prompt;
        if (body.length < prompt.length) {
            console.warn(
                `Groq prompt truncated from ${prompt.length} to ${MAX_PROMPT_CHARS} characters`,
            );
        }

        const completion = await this.groqAPI.chat.completions.create({
            messages: [{ role: "user", content: body }],
            model: "groq/compound",
        });

        const text = completion.choices[0]?.message?.content ?? "Unknown error";
        return text;
    }
}