# EjoFlow — Notes (updated Aug 17, 2026)

## Project
- React + Vite + TypeScript + Tailwind + framer-motion + react-router-dom + lucide-react (frontend, `/`)
- Express backend proxy (`server/`): `npm start` → http://localhost:3001
- Run: `npm run dev` (frontend) + `npm run start` in `server/` (backend)
- Vite dev proxy: `/api` → `http://localhost:3001`

## EjoChat AI — WIRED ✓
- `server/index.js` proxies `POST /api/chat` → `https://api.ejolabs.com/api/v1/subiza` with `X-API-Key`
- **API key lives ONLY in `server/.env` (gitignored)** — never in frontend code. Copy `server/.env.example` for new machines.
- `src/services/ejoChatService.ts` — `send(providerId, messages)` → `POST /api/chat`, returns `{ text }` from `choices[0].message.content`
- `useConversation` keeps full message history (stateless API, full history sent each turn), error bubble on failure
- `ConversationWorkspacePage` — full chat UI: provider sidebar (logo/capabilities), ServicePath stepper, bubbles, typing indicator, Enter-to-send. Route: `/app/ibiganiro/:providerId`
- `ProviderWorkspacePage` — shows real provider from URL + "Tangira ikiganiro" → chat
- Verified E2E in browser: Tangira → chat → AI reply in Kinyarwanda, multi-turn history works

## n8n integration (Gmail via tools) — WIRED ✓ + RESPONSE NORMALIZATION LAYER
Flow: user → EjoChat → emits `[[TOOL:provider:action]]` → backend → n8n webhook → raw result → **`server/normalizer.js`** → clean user-oriented structure → EjoChat → final reply → frontend.
- **Normalizer** (`server/normalizer.js`): converts raw service JSON into `{type, title, count, items}` (e.g. `email_list` with sender/subject/summary/date). Handles `unknown_action` → `unsupported_action`, n8n failures → `service_unavailable`, and strips invisible chars from snippets. New providers = add a case here.
- **No internal detail ever reaches the user/frontend**: API response is only `{ reply, ui }` (ui = normalized renderable data or absent). provider/action/status/requestId/webhook/n8n/raw JSON are logged server-side only (`[ejochat:tool]` console logs).
- **Errors phrased naturally**: unsupported action → "Sinshoboye gukora icyo gikorwa kuri iyi serivisi ubu."; unavailable → "Serivisi ntishoboye kugerwaho ubu...". Static fallback replies if EjoChat itself fails.
- **Language**: answer system prompt is built per-request — Kinyarwanda default (RW keyword detection), English when the user writes English (`answerPrompt(detectUserLanguage(messages))`).
- Backend (`server/index.js`) sends a system prompt asking EjoChat to end replies with a tool marker; parses `[[TOOL:gmail:read_inbox]]`; calls `N8N_WEBHOOK_URL` (POST `{provider, action, messages}`); then a second EjoChat call summarizes the normalized result. If n8n is missing/fails → normalized `service_unavailable` path (chat never breaks).
- **Setup**: import `server/n8n/ejochat-gmail-workflow.json` into n8n → set Gmail OAuth2 credential → activate webhook → set `N8N_WEBHOOK_URL` in `server/.env` → restart backend. See `server/n8n/README.md`.
- **LIVE ✓** (n8n.cloud, workflow `5t5dYgqON1ZivFQB`, account ingabiredalcove@gmail.com, webhook `https://dalcove.app.n8n.cloud/webhook/ejochat-gmail`, N8N_WEBHOOK_URL set in server/.env). Verified E2E in both languages: "Reka mbone imenyesha zanjye za Gmail" → Kinyarwanda summary; "Check my emails please" → English summary. Response = `{reply, ui}` only.
- **n8n gotchas fixed live via n8n MCP API** (key pasted in chat — treat as secret, MCP server at dalcove.app.n8n.cloud/mcp-server/http): webhook needs explicit `httpMethod: "POST"` (not `multipleMethods: []`), Gmail node in this n8n version uses `operation: "getAll"` + `returnAll/limit/simple` + `filters.readStatus` (NOT getMany), webhook wraps body → use `$json.body.action` / `$('Webhook').first().json.body.action` in expressions, and the Webhook→IF connection was missing after import. Updated workflow JSON in repo matches the live fixed version.

## Providers (dashboard)
- 10 providers in `src/data/providers.ts` (Irembo, RSSB, RNP, RRA, RSB, Gmail, WhatsApp, EjoFlow Business, My Tasks, EjoChat)
- Statuses: 6 Demo (amber badge, "Demo y'igerageza" note) + 4 Connected (Bihujwe)
- Category filters (Leta/Ibiganiro/Ubucuruzi/Ku giti cye/AI) + search "Shaka serivisi..."
- `providerService.list()/getById()` returns this catalog — swap to real API when backend arrives

## Auth (mock until real backend)
- `authService` — localStorage session; login uses typed identifier; `RequireAuth` guards `/app/*` → `/injira`

## Git
- Remote: https://github.com/DalcoveDev/EjoFlow.git (branch `master`)
- `.gitignore`: node_modules/, dist/, *.log, server/.env
- NOTE: dashboard + EjoChat wiring NOT yet committed