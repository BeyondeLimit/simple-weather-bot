# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development (watch mode, auto-reloads)
npm run start:watch

# Development (single run via ts-node)
npm start

# Build TypeScript to dist/
npm run build

# Run compiled production build
npm run start:prod
```

No test or lint scripts are configured.

## Architecture

Telegram bot written in TypeScript using Telegraf. Provides weather data and AI-powered financial market insights.

**Request flow:**
```
Telegram → main.ts (Telegraf setup)
         → CommandsController (command handlers)
         → Services (WeatherFindingService, GroqService)
         → APIs (weather via axios, AI via Groq/Gemini SDKs)
         → replyWithTelegramHtml() → Telegram user
```

**Bot commands:**
| Command | Handler | AI/API used |
|---------|---------|-------------|
| `/start` | `handleStart()` | None |
| `/weather` | `requestLocation()` → `getWeatherByLocation()` | Open-Meteo weather API |
| `/gemini` | `getTodaysMarketSuggestion()` | Google Gemini |
| `/today` | `getGroqTodayMessage()` | Groq |
| `/etf` | `getGroqSpecificQuestionMessage()` | Groq |

**Key constraints built into prompts (`src/prompts/telegram-llm-prompt.ts`):**
- LLM output capped at 3,500 chars (Telegram limit is 4,096)
- Groq payloads capped at 12,000 chars total (avoids 413 errors)
- HTML-only output format (no Markdown) — Telegraf sends messages with `parse_mode: 'HTML'`
- User input is HTML-entity-escaped before being passed to LLMs

**Error handling:**
- `bot-error-handler.ts` catches all Telegraf errors globally to prevent crashes
- `reply-telegram-html.ts` falls back to plain text if HTML parse fails

## Environment Variables

Loaded by `src/utils/config.ts` (tries `./config/.env` then falls back to `dotenv` defaults):

```
BOT_TOKEN=        # Telegram bot token
GEMINI_API_KEY=   # Google Generative AI key
GROQ_API_KEY=     # Groq API key
```

Weather API endpoint and key (`API_ENDPOINT`, `API_KEY`) are also read from config but the weather service currently uses the Open-Meteo public API (no key required in practice).

## Docker

Multi-stage build: builder stage compiles TypeScript, runner stage copies `dist/` and installs only production deps. The `dist/` directory is generated during build and should not be committed.
