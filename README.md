# ET Concierge v2 — Agentic AI Financial Intelligence
### ET AI Hackathon 2026 · Angular 19 · Gemini Flash (Free)

---

## Quick Start

```bash
npm install
ng serve
# → http://localhost:4200
```

## Enable Real AI (Free — 2 minutes)

1. Go to **https://aistudio.google.com/apikey** and create a free key
2. Open `src/environments/environment.ts`
3. Replace `YOUR_GEMINI_API_KEY_HERE` with your key
4. Save and run — live Gemini Flash responses activate automatically

> Free tier: 15 requests/min, 1500/day — perfect for demo

---

## Architecture — 4 Agentic Layers

```
┌─────────────────────────────────────────────────────────┐
│                   ET Concierge v2                       │
├──────────────┬──────────────┬────────────┬──────────────┤
│  Profiling   │  Navigator   │Opportunity │  Fulfilment  │
│    Agent     │    Agent     │   Agent    │    Agent     │
│              │              │            │              │
│ Runs 5-step  │ Delivers AI  │ Keyword    │ Executes     │
│ onboarding   │ briefings    │ interrupt  │ actions:     │
│ modal        │ from live    │ — fires    │ SIP, apply,  │
│              │ market data  │ proactively│ register     │
│ Builds user  │ + ET Markets │ on context │              │
│ memory model │              │ match      │ Checks off   │
│              │ Gemini Flash │            │ task list    │
│ Activates    │ OR local     │ No user    │              │
│ other agents │ engine       │ prompt     │ Confirms     │
│ on complete  │              │ needed     │ completion   │
└──────────────┴──────────────┴────────────┴──────────────┘
```

## Proactive Opportunity Agent

When user message contains trigger keywords, the Opportunity Agent
fires an interrupt BEFORE the main response — this is the key
agentic behaviour that differentiates from a chatbot:

| Keyword match          | Opportunity surfaced        |
|------------------------|-----------------------------|
| home / loan / property | HDFC Home Loan 8.35%        |
| invest / fund / sip    | Quant Mid Cap (ET Markets)  |
| event / summit / talk  | ET Wealth Summit Mar 28     |
| card / cashback        | Axis Ace pre-approval       |

## Fulfilment Agent Actions

After intent-heavy messages (apply, register, invest, start SIP),
the Fulfilment Agent injects a task list 1.2s later. Each row is
clickable — checking it off fires a confirmation message and
updates the Discovery Score.

## File Structure

```
src/app/
├── models/index.ts                    All TypeScript interfaces
├── services/
│   ├── gemini.service.ts              Free Gemini Flash API
│   ├── market.service.ts              Live NIFTY/Gold ticker
│   ├── user-profile.service.ts        User state + agent status
│   ├── portfolio.service.ts           Portfolio + opportunities
│   └── chat.service.ts                4-agent orchestration
└── features/
    ├── header/                        Ticker + agent status bar
    ├── sidebar/                       Profile + ecosystem nav
    ├── chat/                          Main conversation panel
    ├── right-panel/                   Portfolio + ops + journey
    └── profiling/                     5-step onboarding modal
```

## Hackathon Pitch (30-second version)

> "ET Concierge is a 4-agent orchestration system. The Profiling
> Agent builds your financial identity in 3 minutes. The Navigator
> Agent delivers personalised briefings from live ET Markets data
> via Gemini Flash. The Opportunity Agent monitors context in real
> time and surfaces matched ET products proactively — without being
> asked. The Fulfilment Agent closes the loop by executing, not just
> recommending. This is the ET user going from 10% to 100% of ET's
> ecosystem value."
