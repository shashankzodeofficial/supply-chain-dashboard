# Supply Chain Dashboard — Setup Guide

## Step 1 — Install Node.js
Download from https://nodejs.org (choose LTS version)
Verify: open PowerShell and run `node --version`

## Step 2 — Install dependencies
```
cd "C:\Users\hp\OneDrive\Desktop\Shashank\Claude Working\supply-chain-dashboard"
npm install
```

## Step 3 — Create Supabase project
1. Go to https://supabase.com → New Project
2. Copy: Project URL, anon key, service role key, database password
3. Copy `.env.example` to `.env.local` and fill in all values

## Step 4 — Push database schema
```
npm run db:push
```

## Step 5 — Get your Supabase user ID
1. Run `npm run dev`
2. Go to http://localhost:3000 → log in
3. Open Supabase dashboard → Authentication → Users → copy your user ID

## Step 6 — Seed the 12 goals
1. Open `prisma/seed.ts` and replace `shashank-user-id` with your actual user ID
2. Run: `npm run db:seed`

## Step 7 — Get Claude API key
Go to https://console.anthropic.com → API Keys → Create key
Add to `.env.local` as `ANTHROPIC_API_KEY`

## Step 8 — Run locally
```
npm run dev
```
Open http://localhost:3000

## Step 9 — Deploy to Vercel
1. Push to GitHub: `git init && git add . && git commit -m "initial" && git push`
2. Go to https://vercel.com → Import Project → select your repo
3. Add all `.env.local` variables in Vercel → Settings → Environment Variables
4. Deploy — your dashboard is live

## File structure
```
supply-chain-dashboard/
├── app/api/          — All API routes (goals, tasks, AI chat, agents)
├── lib/agents/       — 4 Claude agents + orchestrator + tools
├── store/            — Zustand state management
├── types/            — TypeScript interfaces + scoring utilities
├── prisma/           — Schema + seed with all 12 goals
└── vercel.json       — Cron schedule for Planning + Risk agents
```
