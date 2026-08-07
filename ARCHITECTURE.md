# DuoKarma Architectural Overview

This document outlines the architecture, data flow, and key components of the DuoKarma Business Hub backend, focusing on the AI Engine and Automation Framework.

## 1. System Overview
DuoKarma operates on a **Serverless Architecture**. 
- **Frontend**: React (Vite) Single Page Application (SPA).
- **Backend**: Serverless API routes (e.g. Vercel Serverless Functions) located in the `/api` directory.
- **Database**: Supabase (PostgreSQL) with Row Level Security (RLS) enforcing multi-tenant isolation.
- **AI Providers**: OpenAI-compatible LLMs (Gemini, Groq, Cerebras) acting as the brain for the agentic loops.

## 2. The AI Engine (`api/ai.ts`)
The AI engine is a fully autonomous **ReAct (Reasoning and Acting)** agent capable of methodical planning, multi-step execution, and post-execution validation.

### Provider Fallback Mechanism
To ensure 100% uptime and reliability, the AI engine implements a cascading fallback mechanism. If the primary provider (Gemini) fails due to rate limits or timeouts, the engine automatically attempts the request on a secondary provider (Groq), and then a tertiary provider (Cerebras). This guarantees that the user always gets a response.

### The ReAct Agent Loop
When a user submits a prompt, the engine enters an autonomous loop (capped at 7 iterations to prevent infinite recursion):
1. **Planning (`create_plan`)**: The AI is forced to establish a step-by-step strategy. The backend blocks any data retrieval until a plan is submitted.
2. **Execution (CRUD/Business Tools)**: The AI executes one or more tools (e.g., `search_records`, `update_record`, `get_revenue_summary`). The backend proxies these requests directly to Supabase using the user's JWT to respect RLS constraints.
3. **Validation (`validate_execution`)**: The AI verifies whether the retrieved data successfully satisfies the user's prompt.
4. **Final Response**: Once validated, the AI synthesizes a final text response and returns it to the client.

### Safe Database Actions
Destructive actions (like `delete_record`) require explicit two-phase confirmation. The AI cannot delete records autonomously. Instead, it queues the action and returns a `confirmation_token` to the frontend. The user must explicitly approve the deletion, which then triggers a direct API call bypassing the AI loop.

## 3. Automation Framework (`api/automations/`)
The automation framework provides background processing for scheduled tasks and real-time database events.

### Architecture
- **Engine (`engine.ts`)**: Defines the structure of an `AutomationJob` (Trigger → Condition → Action).
- **Registry (`registry.ts`)**: The central hub where all jobs are defined.
- **Actions & Conditions**: Reusable blocks of logic that evaluate data and perform side effects.

### Triggers
1. **Scheduled (Cron)**: The `api/cron.ts` endpoint is called by an external scheduler (like Vercel Cron) on a defined interval (e.g., daily). It iterates through the Registry and runs all matching scheduled jobs.
2. **Event (Webhook)**: The `api/webhook.ts` endpoint receives payloads from Supabase Database Webhooks when records are created, updated, or deleted, instantly triggering relevant jobs.

### Proactive Insights Engine (`insights.ts`)
A specialized automation job that acts as a proactive Executive Assistant. Running on a weekly schedule, it pulls key metrics (revenue trends, at-risk projects, stagnant leads) from the database and feeds them to the LLM via a background fetch. The LLM generates a concise, actionable insight that is saved directly into the database as a high-priority system alert, notifying the user before they even ask.

## 4. Security & Isolation
- **Row Level Security (RLS)**: The `api/ai.ts` endpoint initializes the Supabase client using the Authorization header (JWT) provided by the frontend. This ensures the AI can only access and modify data that the user is explicitly allowed to see.
- **Secure Endpoints**: The automation endpoints (`cron.ts`, `webhook.ts`) are protected by secure tokens (`CRON_SECRET`, `WEBHOOK_SECRET`) to prevent unauthorized execution.
