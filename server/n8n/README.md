# n8n integration — Gmail through EjoChat

## Flow
User (EjoFlow chat) → EjoChat AI → detects it needs Gmail → emits `[[TOOL:gmail:read_inbox]]`
→ EjoFlow backend (`server/index.js`) calls your n8n webhook → n8n reads Gmail
→ sends result back → backend feeds result to EjoChat → user sees the final answer in Kinyarwanda.

## Setup (one time)

1. **n8n Gmail credential**
   - Open n8n → Credentials → "Gmail" (OAuth2) → sign in with the Gmail account EjoFlow should read.
   - Copy the credential **id** from the URL (e.g. `https://localhost:5678/credentials/<id>`).

2. **Import the workflow**
   - n8n → Workflows → "Import from File" → choose `ejochat-gmail-workflow.json`.
   - Open the "Gmail — Soma imenyesha" node → select your Gmail credential.
     (or edit the file first: replace `replace-with-your-gmail-credential-id`)

3. **Activate the webhook**
   - Toggle the workflow **Active** (top-right). The Webhook node shows its URL,
     e.g. `http://localhost:5678/webhook/ejochat-gmail`.

4. **Point EjoFlow backend at it**
   - `server/.env`: `N8N_WEBHOOK_URL=http://localhost:5678/webhook/ejochat-gmail`
   - Restart the backend: `npm start` in `server/`.

## Test
```
curl -X POST http://localhost:3001/api/chat -H "Content-Type: application/json" -d '{"messages":[{"role":"user","content":"Reka mbone imenyesha zanjye za Gmail"}]}'
```
You should get a final reply summarizing the unread emails from n8n.

## Extending
EjoChat can ask for other actions (e.g. `[[TOOL:gmail:send_email]]`). In n8n:
- Add the matching branch after "Action = read_inbox?" (Edit → add another IF condition)
- or handle them with the "Action = read_inbox?" false branch → route to more nodes.

The backend always sends `{ provider, action, messages }` to the webhook,
so workflows can branch on `{{ $json.action }}`.
If the webhook is missing or fails, the backend falls back to EjoChat's plain reply
(`tool.status = "unavailable"`) — the chat never breaks.