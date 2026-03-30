---
title: "The Security Problems Nobody Talks About When They Vibe Code"
subtitle: "Security vulnerabilities in AI-generated code — drawn from real developer discussions"
author: John
date: March 2026
readTime: "5 min read"
tags: ["AI security","vibe coding","application security","hardcoded secrets","no security review","supply chain risks"]
---

Vibe coding tools like ChatGPT and Cursor generate code by drawing on patterns from massive training datasets, including open-source repositories. This means the code they produce often incorporates patterns from libraries that may have known vulnerabilities, outdated dependencies, or insecure coding practices. When developers blindly trust and ship this code without reviewing dependencies or understanding what libraries are being implicitly referenced, they create a massive supply chain attack surface. A vibe coder might not even realize they've introduced a vulnerable library.

This question came up across multiple subreddits: r/cybersecurity, r/webdev, r/vibecoding, r/MyAIAssistant, r/reddit-answers. It's not a theoretical concern — developers are shipping vibe-coded applications right now and running into these problems in production.

## AI Answer (from Reddit Answers / "Ask" feature)

### 1. Supply Chain Risks and Dependency Blindness
Vibe coding tools like ChatGPT and Cursor generate code by drawing on patterns from massive training datasets, including open-source repositories. This means the code they produce often incorporates patterns from libraries that may have known vulnerabilities, outdated dependencies, or insecure coding practices. When developers blindly trust and ship this code without reviewing dependencies or understanding what libraries are being implicitly referenced, they create a massive supply chain attack surface. A vibe coder might not even realize they've introduced a vulnerable library.
### 2. Injection Vulnerabilities
AI-generated code frequently fails to properly sanitize user input, leading to SQL injection, cross-site scripting (XSS), and command injection vulnerabilities. This happens because the model is generating syntactically correct code but not necessarily security-aware code. Without a human reviewer who understands secure coding patterns, these vulnerabilities slip into production.
### 3. Insufficient Error Handling and Information Disclosure
Vibe-coded applications often have poor error handling that can leak sensitive information through stack traces, debugging output, or verbose error messages. The AI might generate functional error handling but miss security best practices around what information should and shouldn't be exposed to end users.
### 4. Insecure Authentication and Authorization
Security-critical features like authentication flows, password hashing, session management, and role-based access control are areas where vibe-coded applications often fall short. The AI might generate something that "works" for a demo but uses deprecated hashing algorithms, lacks proper session validation, or implements authorization checks incorrectly.
### 5. Inadequate Input Validation and Data Validation
Beyond injection, broader input validation failures are common — accepting malformed data, not validating file uploads, trusting client-side validation without server-side checks, and failing to enforce business logic constraints.
### 6. Misconfiguration of Security Headers and CORS
AI-generated web applications frequently miss important security headers (Content-Security-Policy, X-Frame-Options, etc.) or misconfigure CORS policies, creating opportunities for clickjacking, data theft, and cross-origin attacks.
### 7. Hardcoded Secrets and Credentials
One of the most common and dangerous issues — vibe coders often include hardcoded API keys, database credentials, and other secrets directly in source code. The AI might generate working code for a tutorial or example that includes placeholder credentials that end up in production.
### 8. Lack of Security Testing and Review Culture
The vibe coding workflow itself discourages security review. When developers treat AI output as "good enough" and skip code review, security testing, and vulnerability scanning, they're operating without any safety net. The speed of vibe coding can outpace the speed of security validation.


## What the Research Shows

The numbers are consistent across every study:

- **Veracode**: 45% of AI-generated code samples failed security tests. XSS defences didn't work 86% of the time.
- **Escape.tech**: Scanned 5,600+ vibe-coded apps. Found 2,000+ vulnerabilities, 400+ exposed secrets, 175 cases of PII leakage.
- **Invicti Security Labs**: Generated 20,000 web apps with popular LLMs. 1,182 used "supersecretkey" as the JWT secret.
- **Stanford (Perry et al., 2022)**: People with AI assistance wrote more security flaws than those without — and were more confident their code was secure.
- **CodeRabbit**: AI-written code is 2.74x more likely to contain XSS vulnerabilities.

Bigger models aren't safer. More tokens don't fix bad patterns. The security performance doesn't improve with model size.
## The Patterns That Keep Coming Back

### Hardcoded Secrets

LLMs have favourite default values. "supersecretkey" appears in thousands of AI-generated apps. They also mix up Supabase anon keys (safe with RLS) and service_role keys (skip all security). This is the fastest way to get breached.

**The fix:** Never trust AI output with secrets. Run secret scanning on every commit. Kolega.dev detects leaked API keys, tokens, and credentials anywhere in your repo — including ones that look like they came from an LLM's training data.

### No Security Review

The vibe coding workflow itself discourages security review. When developers treat AI output as "good enough" and skip code review, security testing, and vulnerability scanning, they operate without any safety net. The speed of vibe coding outpaces the speed of security validation.

**The fix:** Build security into the pipeline, not after it. Automated scanning on every commit, with noise reduction so you only review what matters. Kolega.dev's noise reduction eliminates 90% of false positives.

### Supply Chain Risks

AI tools pull patterns from massive training datasets, including open-source repos with known vulnerabilities. When developers ship this code without understanding what dependencies it references, they inherit every flaw those libraries carry.

**The fix:** Generate a full SBOM for every AI-generated codebase. Run SCA tools against all dependencies — including the ones the AI implicitly introduced. Use Kolega.dev's dependency scanner to map every library before it reaches production.

### Injection Vulnerabilities

AI-generated code frequently fails to sanitize user input. SQL injection, cross-site scripting, and command injection are the most common results. The code looks syntactically correct — it just isn't security-aware.

**The fix:** Run parameterized query checks on every database call. Use CSP headers and output encoding for XSS. Kolega.dev's SAST tier catches these patterns across your entire codebase.

### Authentication Theatre

AI tools build professional-looking login forms. But the API endpoints behind them are often wide open — no server-side auth, no row-level security, no session validation. It's security theatre: looks right, works wrong.

**The fix:** Validate every auth endpoint independently of the frontend. Check for Row Level Security on every database table. Kolega.dev's semantic analysis understands auth flows and catches the gaps that SAST pattern matching misses.

## What to Do About It

Vibe coding isn't going away. The productivity gains are real, and the market has spoken. But shipping AI-generated code without security validation is like driving blindfolded because the roads are usually clear.

The fix isn't to stop using AI. It's to add the safety net that the workflow strips away: dependency scanning, secret detection, semantic code analysis, and security review. Automated, noise-free, and fast enough to keep up with the speed of vibe coding.

Kolega.dev was built for exactly this. Deep code scanning that catches what SAST misses, with automated fix generation that understands your codebase. Scan your repo for free and see what's hiding in your AI-generated code.

---

Kolega.dev's deep code scan catches the vulnerabilities that vibe coding introduces — the ones that traditional SAST tools miss. [Scan your repo for free](https://kolega.dev).
