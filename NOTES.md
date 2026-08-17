# EjoFlow — Notes (last session: Aug 17, 2026 ~1:44 AM)

## Project
- React + Vite + TypeScript + Tailwind + framer-motion + react-router-dom + lucide-react
- Kinyarwanda-language frontend for chatting with services (Irembo, RRA, Gmail, WhatsApp, MTN, BK)
- Run: `npm run dev` (preview was on localhost:4173)

## Where I left off
- Last files worked on (in order): types/index.ts, data/providers.ts, ProviderLogo/ProviderMark,
  ProviderDashboardPage, AppShell + AppRoutes (all /app/* routes), ProviderWorkspacePage,
  useConversation hook, then **ConversationWorkspacePage (last, 1:44 AM)** — chat UI with
  message types (user/assistant/question/error/action), service-path stepper (Sobanukirwa→Byarangiye),
  action review card ("Reba mbere yo kwishyura" → navigates to /app/gusuzuma/mutuelle?abantu=N).
- `npm run build` PASSES (vite 8.2.1, 2232 modules).

## Notes / next steps
- All data/services are MOCK (src/services/mock/*) — no backend integration yet.
- Git repo exists but ZERO commits; everything untracked (node_modules, dist included).
- No README yet. No .gitignore yet.
- Irembo flow is the only full conversation flow (Mutuelle payment: count → action → review → pay);
  other providers have generic reply loop in useConversation.