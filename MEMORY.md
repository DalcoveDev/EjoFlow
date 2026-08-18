# EjoFlow — Session Memory (RESUME HERE)

> Read this first when starting a new session. This file preserves continuity if the chat is lost.

## Project
EjoFlow super-app — Kinyarwanda-first provider dashboard + EjoChat AI chat + n8n automation bridge.
Repo: `C:\Users\Administrator\Documents\ChatGPT\EjoFlow` — GitHub `https://github.com/DalcoveDev/EjoFlow.git` (branch `master`).

## Current Phase (as of last session)
**n8n ↔ EjoChat tools bridge is LIVE + Response Normalization Layer is LIVE.**
Flow: User → EjoChat → `[[TOOL:provider:action]]` marker → backend → n8n webhook (real Gmail) → raw JSON → `server/normalizer.js` → clean user structure → EjoChat → Kinyarwanda/English reply → `{reply, ui}` → frontend.

## What's Running
- Frontend dev: `npm run dev` on `http://localhost:5173` (vite proxy `/api` → 3001)
- Backend: `node index.js` in `server/` on `http://localhost:3001` (restart via: kill process on port 3001, then Start-Process hidden)
- n8n: hosted at `dalcove.app.n8n.cloud` (NOT local)

## Credentials (NEVER commit, NEVER paste into replies)
All in `server/.env` (gitignored):
- `EJOCHAT_API_KEY` — EjoChat API (`POST https://api.ejolabs.com/api/v1/subiza`, header `X-API-Key`, body `{"messages":[{"role":"system"|"user"|"assistant","content":...}]}`)
- `N8N_WEBHOOK_URL` = `https://dalcove.app.n8n.cloud/webhook/ejochat-gmail`
- `N8N_MCP_KEY` — n8n MCP server Bearer key (added so a future session can manage n8n without re-asking the user)
- WARNING: keys were pasted in chat history — consider rotating before any public push.

## n8n Access via MCP (for remote fixes)
- Server: `POST https://dalcove.app.n8n.cloud/mcp-server/http`
- Headers: `Authorization: Bearer <N8N_MCP_KEY>`, `Content-Type: application/json`, `Accept: application/json, text/event-stream`
- Body: JSON-RPC `{"jsonrpc":"2.0","id":N,"method":"tools/call","params":{"name":"<TOOL>","arguments":{...}}}`
- Client helper: `C:\Users\Administrator\AppData\Local\Temp\opencode\mcp-client.mjs` (exports `rpc(method, params, id)`; run with `$env:MCP_URL` + `$env:MCP_KEY`)
- IMPORTANT: tools are invoked via `tools/call` (NOT by name directly). Workflow must have **MCP access enabled** (workflow card ⋮ menu) before `get_workflow_details` works.
- Useful tools: `search_workflows`, `get_workflow_details`, `update_workflow` (atomic operations batch: setNodeParameter/addConnection/setNodeCredential), `publish_workflow`, `list_credentials`, `search_executions`, `get_execution` (includeData+nodeNames), `get_node_types` (needs `{nodeId, typeVersion, resource, operation}` for gmail discriminators).

## Live n8n Setup (workflow `5t5dYgqON1ZivFQB`, Gmail account ingabiredalcove@gmail.com)
- Webhook: POST only (`httpMethod:"POST"`, `multipleMethods:false`), path `ejochat-gmail`, `responseMode:"responseNode"`
- IF node branches on `$json.body.action === 'read_inbox'` (webhook wraps body → ALWAYS `$json.body.X`, never `$json.X`)
- Gmail node (this n8n version): `operation:"getAll"`, `returnAll:false`, `limit:5`, `simple:true`, `filters:{readStatus:"unread"}`, credential `gmailOAuth2` = "Gmail account 2" (`IYxQ3cdMAWLx1pXv`) — NOT "getMany"
- Respond node references webhook via `$('Webhook').first().json.body.provider` (Gmail output has `Subject`/`From`/`snippet`/`internalDate` when `simple:true`)
- Import template synced to live: `server/n8n/ejochat-gmail-workflow.json` (replace credential id placeholder when re-importing)

## Architecture Details
- `server/index.js` — orchestration: SYSTEM_TOOL_PROMPT (emits marker) → parse `[[TOOL:provider:action]]` → `callN8n({provider, action, messages})` → `normalizeServiceResult` → second EjoChat call with SYSTEM_ANSWER_PROMPT + language rule → `{reply, ui}` (NO provider/action/status/requestId/raw JSON ever reaches frontend; all internal detail → console logs `[ejochat:tool]`)
- `server/normalizer.js` — `normalizeServiceResult({provider, action, raw})` → `{ok:true, data:{type:"email_list",title,count,items[{sender,subject,summary,date}]}}` or `{ok:false, code:"unsupported_action"|"service_unavailable"}`; `describeForEjoChat`, `errorCodeToHint`. **Add new providers/actions here.**
- `src/services/ejoChatService.ts` — frontend `send(providerId, messages)` → `POST /api/chat`, uses `data.reply`; `ui` field ready for future card rendering (frontend untouched).
- Frontend chat: `ConversationWorkspacePage` `/app/ibiganiro/:providerId`, full history per turn in `useConversation`.

## Test Commands
- Direct webhook: `curl.exe -X POST https://dalcove.app.n8n.cloud/webhook/ejochat-gmail -H "Content-Type: application/json" -d '{"provider":"gmail","action":"read_inbox","messages":[]}'`
- Full loop: `Invoke-RestMethod http://localhost:3001/api/chat -Method Post -ContentType "application/json" -Body '{"messages":[{"role":"user","content":"Reka mbone imenyesha zanjye za Gmail"}]}'`
- English path: same with "Check my emails please" → must reply in English
- Error paths (tested): dead N8N_WEBHOOK_URL → friendly apology, `unknown_action` → friendly unsupported message

## Git State
- 5 commits pushed to `origin/master`: `7f58ebf` (initial) → `166c38d` (dashboard/auth/EjoChat/n8n) → `2cfec65` (SQLite + real-data pages + Menya Serivisi) → `58b21c0` (iPhone 6 chat fix) → `89ef5a4` (Kinyarwanda nav + quota message).
- `.gitignore` covers `node_modules/`, `dist/`, `server/.env`, `server/ejoflow.db*`.
- NOTE: `N8N_MCP_KEY` and `EJOCHAT_API_KEY` were pasted in chat history — rotate before any public/team launch.

## Design Rules (from user)
- **BRAND (non-negotiable): the logo/wordmark is ALWAYS "EjoFlow" — blue "Ejo" + green "Flow". NEVER translate it, NEVER write "Tomorrow Flow" (Ejo = tomorrow). It stays EjoFlow in every language and every copy.**
- No redesign; keep ejo-blue/ejo-green (#123B5D/#16865B), Tailwind, framer-motion, Kinyarwanda-first UI
- No gradients/glassmorphism/excessive shadows; official favicons via google s2 favicons, native lucide icons for EjoFlow brands
- Gov/demo providers: amber "Demo" badge, no false live claims
- User never sees internal terms: provider/action/status/webhook/n8n/API/endpoint/workflow/JSON/status codes — logs only
- Mobile nav labels are Kinyarwanda (Serivisi zanjye, Ibiganiro, Ibikorwa, Umwirondoro)

## Current State (Aug 18, 2026 — after several pushed commits)
- Git: 5 commits pushed to origin/master (latest `89ef5a4`). Branch in sync.
- DB: SQLite via `node:sqlite` (server/db.js, `server/ejoflow.db` gitignored) — conversations/messages/actions tables.
- Menya Serivisi (`/app/menya-serivisi`): service navigator — `POST /api/discover` (server/services-kb.js KB + `discoverPrompt()` strict-JSON + keyword fallback), RDB provider added, route + nav everywhere (AppShell, dashboard CTA, chat header, landing footer).
- Chat page mobile layout: `fixed` frame (`top-16/bottom-[68px]`, `md:top-[72px]`, `lg:static` + 3-col grid) — works on iPhone 6 (iOS 12, no dvh support).
- Quota handling: upstream 429 → backend returns 429 `{error:'quota_exceeded', reply:'⚠️ AI yarushywe kuri uyu munsi…'}` → chat shows friendly bubble.