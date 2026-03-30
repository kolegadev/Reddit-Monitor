---
title: "How to Secure API Keys in AI-Generated Code"
subtitle: "Why AI keeps leaking your secrets — and the 3-minute fix"
author: John
date: March 2026
readTime: "6 min read"
tags: ["AI security","secrets","API keys","credentials","vibe coding"]
---

Invicti Security Labs built 20,000 web applications using popular LLMs. 1,182 of them used "supersecretkey" as their JWT secret. Not a unique, randomly generated value — the same literal string, copied from who knows where in the training data.

This is the most common vulnerability in AI-generated code, and it's the easiest to prevent.

## Why AI keeps leaking secrets

LLMs train on millions of open-source repositories, tutorials, and Stack Overflow answers. Many of these contain placeholder credentials, example API keys, and test values. The model learns these as patterns and reproduces them in generated code.

The problem isn't that the AI is broken. It's that it's faithfully reproducing what it learned from the training data — which includes a lot of insecure code written for tutorials and demos.

The most common secrets that appear in AI-generated code:

- **JWT secrets**: "supersecretkey", "your-256-bit-secret", "changeme"
- **Database credentials**: "root:password", "admin:admin", "postgres:postgres"
- **API keys**: Hardcoded OpenAI, AWS, and Stripe keys from example code
- **Supabase confusion**: Anon key used where service_role key should go (or vice versa)

## The EnrichLead example

Leonel Acevedo built his entire product with "Cursor AI, zero hand-written code." Within days, security researchers found API keys hardcoded on the client side, no authentication on endpoints, and no rate limiting. Someone spent $14,000 on his OpenAI credits. The paywall could be bypassed by changing one value in the browser console.

This isn't an outlier. It's what happens when AI-generated code goes to production without secret scanning.

## The 3-minute fix

**Step 1: Scan your repo.** Run secret detection across your entire codebase — not just the files you wrote, but every file the AI generated too. Kolega.dev's secret scanner finds leaked API keys, tokens, passwords, and credentials anywhere in the repo, including values that look like they came from LLM training data.

**Step 2: Move secrets to environment variables.** Replace every hardcoded value with an environment variable reference. If the AI generated `const JWT_SECRET = "supersecretkey"`, change it to `const JWT_SECRET = process.env.JWT_SECRET`.

**Step 3: Rotate everything.** Assume any secret that was in the codebase is compromised. Generate new API keys, database passwords, and JWT secrets. Add the old values to a blocklist if your provider supports it.

## Prevent it from happening again

- **Pre-commit hooks**: Run secret scanning before every commit. If a credential hits the repo, the commit fails.
- **CI pipeline**: Add secret detection to your build pipeline. No merge if secrets are detected.
- **Environment variable management**: Use `.env` files (gitignored) for local development and a secrets manager for production.
- **Code review**: Specifically check AI-generated code for hardcoded values. This is the one thing worth reviewing line by line.

## The Supabase gotcha

This one deserves special attention because it's so common. Supabase has two keys:

- **Anon key**: Safe to include in frontend code. Subject to Row Level Security.
- **Service role key**: Bypasses ALL security. Should never be in frontend code.

LLMs consistently mix these up. If your AI-generated app has the service role key in a client-side bundle, anyone can bypass your entire security model. Verify which key is where.

## Don't trust the AI's defaults

The pattern is always the same: the AI generates working code with placeholder credentials, the developer doesn't change them, and the application ships with "supersecretkey" as its JWT secret.

Add secret scanning to your pipeline and this problem disappears. The tools are free. The fix takes minutes. The breach it prevents takes months to recover from.

---

Kolega.dev detects leaked API keys, tokens, and credentials anywhere in your repo — including the ones your AI assistant copied from its training data. [Scan for free](https://kolega.dev).
