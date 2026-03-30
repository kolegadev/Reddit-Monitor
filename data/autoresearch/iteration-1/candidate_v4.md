---
title: "The Security Problems Nobody Talks About When They Vibe Code"
subtitle: "Real vulnerabilities from real AI-generated code — with numbers"
author: John
date: March 2026
readTime: "5 min read"
tags: ["AI security","vibe coding","application security","hardcoded secrets","code review"]
---

A junior developer on your team just shipped a Next.js app with a Supabase backend. It looks great. The login works. The dashboard renders. But the `service_role` key — the one that bypasses all Row Level Security — is committed in `.env.local` and the repo is public. Nobody caught it because there was no code review. The AI generated it, it worked, they deployed.

Within a week, someone found the key. Your production database is exposed.

This is the most common pattern we see. Not sophisticated attacks, not zero-days — just copied credentials from an LLM's training data.

## The Numbers

These aren't edge cases. Multiple security research groups have tested AI-generated code at scale:

- **45%** of AI-generated code samples failed security tests. XSS defences didn't work 86% of the time (Veracode).
- **2,000+ vulnerabilities** across 5,600 vibe-coded apps — 400+ exposed secrets, 175 cases of PII leakage (Escape.tech).
- **1,182 out of 20,000** AI-generated web apps used `"supersecretkey"` as their JWT secret (Invicti Security Labs).
- **Stanford (Perry et al., 2022)**: Developers with AI assistance wrote *more* security flaws than those without — and were *more confident* their code was secure.
- AI-written code is **2.74x more likely** to contain XSS vulnerabilities (CodeRabbit).

Bigger models aren't safer. More tokens don't fix bad patterns.

## The Five Patterns

### 1. Hardcoded Secrets

LLMs have favourite default values. `"supersecretkey"` appears in thousands of AI-generated apps. They also mix up Supabase anon keys (safe with RLS) and `service_role` keys (skip all security). A developer copies the code, it works locally, they ship it — database wide open.

Run secret scanning on every commit. Kolega.dev detects leaked API keys, tokens, and credentials anywhere in your repo, including ones seeded from LLM training data.

### 2. No Security Review

The vibe coding workflow actively discourages security review. Developers treat AI output as "good enough" and skip code review and vulnerability scanning. The speed of generation outpaces the speed of validation.

This isn't laziness — it's a workflow problem. When you're shipping features 5x faster, your security process needs to match. "We already have Dependabot" isn't enough when the AI is introducing dependencies you don't even know about.

Build scanning into the pipeline. Kolega.dev eliminates 90% of false positives so your team reads the alerts instead of ignoring them.

### 3. Injection Vulnerabilities

AI-generated code frequently fails to sanitize user input. SQL injection, XSS, and command injection are the most common results. The code looks syntactically correct — it just isn't security-aware. Veracode found XSS defences in AI code didn't work 86% of the time.

Your existing SAST tool catches some of these. But pattern matching misses the subtle, context-aware vectors that AI code tends to produce. Kolega.dev's semantic analysis catches what regex-based tools miss.

### 4. Supply Chain Blindness

AI tools pull patterns from massive training datasets, including open-source repos with known vulnerabilities. When developers ship this code without understanding what dependencies it references, they inherit every flaw those libraries carry. The AI doesn't tell you which library pattern it copied, or which version, or whether that version was compromised.

Generate a full SBOM for every AI-generated codebase. Run SCA tools against all dependencies — including the ones the AI implicitly introduced. Kolega.dev's dependency scanner maps every library before it reaches production.

### 5. Authentication Theatre

AI tools build professional-looking login forms. The API endpoints behind them are often wide open — no server-side auth, no row-level security, no session validation.

This is dangerous because it *looks* right. Your QA team tests the UI, the login works, they mark it done. Nobody checks whether the API endpoint requires authentication.

Validate every auth endpoint independently of the frontend. Kolega.dev's semantic analysis understands auth flows and catches the gaps that pattern matching misses.

## The Real Question

You're already using SAST. You already have Dependabot. You already do code review. The question isn't whether you have security tools — it's whether those tools were designed for code written by machines.

Traditional tools assume a developer wrote the code and made human-style mistakes. AI-generated code fails in different ways: it uses correct syntax to implement incorrect security logic, it introduces dependencies the developer didn't choose, and it creates patterns that look safe but aren't.

Kolega.dev was built to catch what those tools miss. Deep semantic code analysis, dependency scanning, and secret detection — automated, noise-free, and fast enough to keep up with vibe coding. [Scan your repo for free](https://kolega.dev).
