---
title: "The Security Problems Nobody Talks About When They Vibe Code"
subtitle: "Real vulnerabilities from real AI-generated code — with numbers"
author: John
date: March 2026
readTime: "4 min read"
tags: ["AI security","vibe coding","application security","hardcoded secrets","code review"]
---

Senior developers are shipping vibe-coded applications into production right now. The security problems are already showing up. Here's what's actually happening, pulled from discussions across r/cybersecurity, r/webdev, and r/vibecoding — backed by the research.

## The Numbers

- **45%** of AI-generated code samples failed security tests (Veracode). XSS defences didn't work 86% of the time.
- **2,000+ vulnerabilities** found across 5,600 vibe-coded apps, including 400+ exposed secrets and 175 cases of PII leakage (Escape.tech).
- **1,182 out of 20,000** AI-generated web apps used `"supersecretkey"` as their JWT secret (Invicti Security Labs).
- **Stanford (Perry et al., 2022)**: Developers with AI assistance wrote *more* security flaws than those without — and were *more confident* their code was secure.
- AI-written code is **2.74x more likely** to contain XSS vulnerabilities (CodeRabbit).

Bigger models aren't safer. More tokens don't fix bad patterns. The security performance doesn't improve with model size.

## The Five Patterns That Keep Coming Back

### 1. Hardcoded Secrets

LLMs have favourite default values. `"supersecretkey"` appears in thousands of AI-generated apps. They also mix up Supabase anon keys (safe with RLS) and `service_role` keys (skip all security). A developer copies the code, it works locally, they ship it — and now their database is wide open.

**What to do:** Run secret scanning on every commit. Period. No exceptions. Kolega.dev detects leaked API keys, tokens, and credentials anywhere in your repo — including ones that look like they came from an LLM's training data.

### 2. No Security Review

The vibe coding workflow actively discourages security review. Developers treat AI output as "good enough" and skip code review, security testing, and vulnerability scanning. The speed of generation outpaces the speed of validation.

This isn't laziness — it's a workflow problem. When you're shipping features 5x faster, your security process needs to match.

**What to do:** Build scanning into the pipeline, not after it. Automated scanning on every commit, with noise reduction so you only review what matters. Kolega.dev eliminates 90% of false positives so your team actually reads the alerts.

### 3. Injection Vulnerabilities

AI-generated code frequently fails to sanitize user input. SQL injection, XSS, and command injection are the most common results. The code looks syntactically correct — it just isn't security-aware. Veracode found that XSS defences in AI code didn't work 86% of the time.

**What to do:** Run parameterized query checks on every database call. Use CSP headers and output encoding for XSS. Kolega.dev's SAST catches these patterns across your entire codebase.

### 4. Supply Chain Blindness

AI tools pull patterns from massive training datasets, including open-source repos with known vulnerabilities. When developers ship this code without understanding what dependencies it references, they inherit every flaw those libraries carry. The AI doesn't tell you which library pattern it copied from version 2.3.1 of something that was compromised in version 2.0.0.

**What to do:** Generate a full SBOM for every AI-generated codebase. Run SCA tools against all dependencies — including the ones the AI implicitly introduced. Kolega.dev's dependency scanner maps every library before it reaches production.

### 5. Authentication Theatre

AI tools build professional-looking login forms. The API endpoints behind them are often wide open — no server-side auth, no row-level security, no session validation. It passes the visual test but fails the actual security test.

**What to do:** Validate every auth endpoint independently of the frontend. Check for Row Level Security on every database table. Kolega.dev's semantic analysis understands auth flows and catches the gaps that SAST pattern matching misses.

## The Fix

Vibe coding isn't going away. The productivity gains are real. But shipping AI-generated code without security validation is like driving blindfolded because the roads are usually clear.

The answer isn't to stop using AI. It's to add the safety net that the workflow strips away: dependency scanning, secret detection, semantic code analysis, and security review — automated, noise-free, and fast enough to keep up.

Kolega.dev was built for exactly this. Deep code scanning that catches what SAST misses, with automated fix generation that understands your codebase. [Scan your repo for free](https://kolega.dev).
