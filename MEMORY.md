# EjoFlow — Session Memory (RESUME HERE)

> Read this first when starting a new session. This file preserves continuity if the chat is lost.

## Project
EjoFlow super-app — Kinyarwanda-first provider dashboard + EjoChat AI chat + n8n automation bridge + **i18n (rw/en/fr)**.
Repo: `C:\Users\Administrator\Documents\ChatGPT\EjoFlow` — GitHub `https://github.com/DalcoveDev/EjoFlow.git` (branch `master`).

## Current Phase (as of last session)
**Notification bell + voice input + settings page are SHIPPED (commit `145906f`).**
- NotificationBell (`src/components/layout/NotificationBell.tsx`): live actions feed, unread dot (localStorage `ejoflow.notifSeen`), opening marks read, items link to `/app/ibikorwa`, empty state. Replaced the fake bell in AppShell.
- Voice input: mic button in chat composer (Web Speech API, `en-US`; Kinyarwanda unsupported → shows `chat.voiceHint` inline for 3s).
- Settings (`/app/igenamiterere`): change display name (`authService.updateName` + `AuthContext.updateName`), export all data JSON (`GET /api/export`, blob download), two-step clear-all (`POST /api/data/clear` → `exportAllData()`/`clearAllData()` in `server/db.js`). Entry in profile dropdown + ProfilePage.
- New translation keys: `notif.*`, `chat.voice*`, `settings.*`, `title.settings`.

## What's Running
- Frontend dev: `npm run dev` on `http://localhost:5173` (vite proxy `/api` → 3001)
- Backend: `node index.js` in `server/` on `http://localhost:3001` (restart via: kill process on port 3001, then `Start-Process node index.js -WorkingDirectory "...\EjoFlow\server" -WindowStyle Hidden` — WorkingDirectory is mandatory)
- n8n: hosted at `dalcove.app.n8n.cloud` (NOT local)

## Credentials (NEVER commit, NEVER paste into replies)
All in `server/.env` (gitignored):
- `EJOCHAT_API_KEY` — EjoChat API (`POST https://api.ejolabs.com/api/v1/subiza`, header `X-API-Key`, body `{"messages":[{"role":"system"|"user"|"assistant","content":...}]}`)
- `N8N_WEBHOOK_URL` = `https://dalcove.app.n8n.cloud/webhook/ejochat-gmail`
- `N8N_MCP_KEY` — n8n MCP server Bearer key
- WARNING: keys were pasted in chat history — rotate before any public push.

## n8n Access via MCP (for remote fixes)
- Server: `POST https://dalcove.app.n8n.cloud/mcp-server/http`, `Authorization: Bearer <N8N_MCP_KEY>`, JSON-RPC `tools/call` (tool name in `params.name`, args in `params.arguments`)
- Client helper: `C:\Users\Administrator\AppData\Local\Temp\opencode\mcp-client.mjs` (exports `rpc`; run with `$env:MCP_URL` + `$env:MCP_KEY`)
- IMPORTANT: workflow must have **MCP access enabled** (workflow card ⋮ menu) before `get_workflow_details` works.
- Useful tools: `search_workflows`, `get_workflow_details`, `update_workflow` (setNodeParameter/addConnection/setNodeCredential), `publish_workflow`, `list_credentials`, `search_executions`, `get_execution` (includeData+nodeNames), `get_node_types`.

## Live n8n Setup (workflow `5t5dYgqON1ZivFQB`, Gmail account ingabiredalcove@gmail.com)
- Webhook: POST only, path `ejochat-gmail`, `responseMode:"responseNode"`; IF node branches on `$json.body.action === 'read_inbox'` (webhook wraps body → ALWAYS `$json.body.X`)
- Gmail node: `operation:"getAll"`, `returnAll:false`, `limit:5`, `simple:true`, `filters:{readStatus:"unread"}`, credential `gmailOAuth2` = "Gmail account 2" (`IYxQ3cdMAWLx1pXv`)
- Respond node references `$('Webhook').first().json.body.provider` (Gmail output: `Subject`/`From`/`snippet`/`internalDate` when `simple:true`)
- Import template: `server/n8n/ejochat-gmail-workflow.json` (replace credential id placeholder when re-importing)

## Architecture Details
- `server/index.js` — orchestration: SYSTEM_TOOL_PROMPT → `[[TOOL:provider:action]]` → `callN8n` → `normalizeServiceResult` → second EjoChat call → `{reply, ui}`. `mode:'do'` uses SYSTEM_DO_PROMPT (Binkorere). Reads `lang` from body → `QUOTA_REPLIES` map (rw/en/fr) for 429 replies.
- `server/normalizer.js` — `normalizeServiceResult({provider, action, raw})` → `{ok:true, data:{type:"email_list",...}}` or `{ok:false, code}`. **Add new providers/actions here.**
- `src/services/ejoChatService.ts` — `send(providerId, messages, conversationId?, regenerate?, mode?, lang?)` → `POST /api/chat`.
- i18n: `src/i18n/LanguageContext.tsx` — `LanguageProvider`, `useI18n()` → `{t, t2, lang, setLang, langNames}`; `t(key)` = `translations[lang]?.[key] ?? translations.rw[key] ?? key`; `t2(key, vars)` replaces `{m}`/`{a}`/`{n}`. Lang persisted in `localStorage 'ejoflow.lang'`, default `'rw'`, sets `document.documentElement.lang`. Dictionary: `src/i18n/translations.ts` (~200 keys × 3 langs).
- **Translation scope:** chrome/nav/titles/headers/subtitles/empty states/CTAs/static content translated; AI-generated content (chat replies, discover results, KB guides) follows the user's message language; provider descriptions/capabilities stay Kinyarwanda.
- AppShell: desktop sidebar (lg) + drawer (mobile) + MobileNav bottom (4 items: nav.services, nav.myWork, nav.binkorere, nav.chats) + LangMenu (Globe) + profile dropdown (Umwirondoro/Ibikorwa/Ubufasha/Sohoka). aria-labels use t('ui.openMenu')/t('ui.closeMenu').
- Binkorere executor: `src/hooks/useBinkorere.ts` + `src/pages/BinkorerePage.tsx` (`/app/binkorere`, sends with `mode:'do'`, task cards + stage strip).
- My Work hub: `src/pages/MyWorkPage.tsx` (`/app/akazi-kanjye`) — person-based assistants (EjoChat/Gmail/WhatsApp/My Tasks), GERAGEZA chips navigate with `?q=` → auto-send (ConversationWorkspacePage reads `useSearchParams`).

## Test Commands
- Direct webhook: `curl.exe -X POST https://dalcove.app.n8n.cloud/webhook/ejochat-gmail -H "Content-Type: application/json" -d '{"provider":"gmail","action":"read_inbox","messages":[]}'`
- Full loop: `Invoke-RestMethod http://localhost:3001/api/chat -Method Post -ContentType "application/json" -Body '{"messages":[{"role":"user","content":"Reka mbone imenyesha zanjye za Gmail"}]}'`
- Localized quota reply: same + `"lang":"fr"` in body (verify `reply` is French) — EjoChat is currently quota'd (429) so this is testable live.
- Browser QA: `node C:\Users\Administrator\.claude\skills\browser-automation\browser.mjs http://localhost:5173 --script <file>` — login `/injira` with `0780000000` / `password123` ("Injira" button). QA scripts in `C:\Users\Administrator\AppData\Local\Temp\opencode\` (qa-binkorere.mjs, qa-mywok.mjs, qa-i18n.mjs).
- **QA gotchas:** (1) Vite cold-compiles route chunks — warm up every route before asserting, or locator timeouts look like bugs. (2) `ui.snapshot()` (compact) lists ONLY interactive elements — headings/text need `{ full: true }`. (3) `data-ab-ref` refs are stale after React re-renders — prefer `page.getByLabel/getByRole/getByPlaceholder` for clicks.

## Git State
- Pushed to `origin/master`: `7f58ebf` → `166c38d` → `2cfec65` → `58b21c0` → `89ef5a4` → `1e20c3b` → **`50c6991`** (Binkorere AI) → **`adcd768`** (Akazi kanjye) → **`1e5164a`** (i18n rw/en/fr + search). Branch in sync.
- `.gitignore` covers `node_modules/`, `dist/`, `server/.env`, `server/ejoflow.db*`.
- NOTE: rotate `N8N_MCP_KEY` + `EJOCHAT_API_KEY` before any public/team launch.

## Design Rules (from user)
- **BRAND (non-negotiable): the logo/wordmark is ALWAYS "EjoFlow" — blue "Ejo" + green "Flow". NEVER translate it, NEVER write "Tomorrow Flow" (Ejo = tomorrow). It stays EjoFlow in every language and every copy.**
- No redesign; keep ejo-blue/ejo-green (#123B5D/#16865B), Tailwind, framer-motion, Kinyarwanda-first UI with EN/FR toggle
- No gradients/glassmorphism/excessive shadows; official favicons via google s2 favicons, native lucide icons for EjoFlow brands
- Gov/demo providers: amber "Demo" badge, no false live claims
- User never sees internal terms: provider/action/status/webhook/n8n/API/endpoint/workflow/JSON/status codes — logs only
- Nav labels are translated via keys (nav.*): rw = Serivisi zanjye/Akazi kanjye/Binkorere AI/Menya Serivisi/Ibiganiro/Ibikorwa/Ubufasha
- **CRITICAL encoding rule:** NEVER use PowerShell 5.1 `Get-Content`/`Set-Content` on source files (system locale is Chinese/GBK → corrupts UTF-8; mangled `—`/accents). Use ONLY Read/Edit/Write tools or `[IO.File]::ReadAllText/WriteAllText` with explicit UTF-8 (no BOM) if a scripted edit is needed.

## Current State (Aug 19, 2026 — after `1e5164a`)
- i18n: LanguageProvider wraps app in `main.tsx`; all pages use `t()`/`t2()` (AppShell, Dashboard, MyWork, Binkorere, MenyaSerivisi +`categoryKey` mapper, Conversations +search, Activity +search +friendlyAction, Workspace, Help, Login, Profile +language buttons, Landing).
- Server: `/api/chat` accepts `lang`, quota replies localized (`QUOTA_REPLIES` in server/index.js). Verified live: fr + en quota replies.
- Search: ConversationsPage filters by provider name (binkorere → "Binkorere AI") or last_message; ActivityPage filters by provider name or friendly action label. Both verified in QA.
- Upstream EjoChat quota EXHAUSTED (429) — live AI QA blocked; use mocked routes or verify routing via 429 responses.