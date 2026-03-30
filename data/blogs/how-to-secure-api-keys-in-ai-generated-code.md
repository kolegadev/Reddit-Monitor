---
title: "How to Secure API Keys in AI-Generated Code"
subtitle: "Why AI keeps leaking your secrets — and the 3-minute fix"
author: John
date: March 2026
readTime: "6 min read"
tags: ["AI security","secrets","API keys","credentials","vibe coding"]
---

Invicti Security Labs built 20,000 web applications using popular LLMs. 1,182 of them — nearly 6% — used `"supersecretkey"` as their JWT secret. The same literal string, reproduced from tutorial code baked into training data.

That's not the worst part. Those 1,182 apps also had hardcoded database credentials, exposed API keys, and misconfigured authentication. The AI didn't make a typo. It followed the patterns it learned from thousands of Stack Overflow answers and GitHub repos where developers use placeholder values in examples that eventually get copy-pasted into production.

## What leaks, and why

These are the most common secrets appearing in AI-generated codebases, based on Invicti's dataset and our own scans:

| Secret Type | Common LLM-Generated Values | Risk |
|---|---|---|
| JWT secrets | `"supersecretkey"`, `"your-256-bit-secret"`, `"changeme"` | Full auth bypass |
| Database creds | `root:password`, `admin:admin`, `postgres:postgres` | Data exfiltration |
| API keys | Hardcoded OpenAI, AWS, Stripe keys from example repos | Credential theft, billing fraud |
| Supabase keys | `anon` key used in backend, or `service_role` exposed client-side | Complete security model bypass |

The root cause isn't an LLM bug. It's structural: models train on code written for tutorials, demos, and quickstarts — code that was never meant to be secure. When you prompt "build me a JWT auth flow," the model returns what it's seen most often: working code with placeholder secrets.

## The $14,000 AI-generated breach

Leonel Acevedo built his product, EnrichLead, with "Cursor AI, zero hand-written code." Security researchers found API keys hardcoded on the client side, unauthenticated endpoints, and no rate limiting. Someone spent $14,000 on his OpenAI credits in days. The paywall was bypassable by editing one value in the browser console.

Acevedo isn't unique — he's the most public example of a systematic problem. When AI generates your code, the default posture is "working but insecure." Every secret the LLM inserts is a mine that detonates when the code ships.

## The 3-minute fix

**Step 1: Scan your repo for secrets.** Not just the files you wrote — every file the AI generated. Kolega.dev's scanner detects leaked API keys, tokens, passwords, and credentials across your entire codebase, including values reproduced from LLM training data patterns.

**Step 2: Move secrets to environment variables.** Replace every hardcoded value with an env var reference:

```javascript
// Before (AI-generated)
const JWT_SECRET = "supersecretkey"

// After
const JWT_SECRET = process.env.JWT_SECRET
```

**Step 3: Rotate everything.** Any secret that existed in your codebase should be considered compromised. Generate new keys. Blocklist old values if your provider supports it. If your OpenAI key was in a GitHub repo, even briefly, revoke it — GitHub's public event stream means scanners found it within seconds.

## Prevent it from happening again

- **Pre-commit hooks**: Run secret scanning before every commit. If a credential hits the repo, the commit fails. Tools like `detect-secrets`, `gitleaks`, or Kolega.dev's CLI make this a one-line config.
- **CI pipeline**: Add secret detection to your build. No merge if secrets are detected.
- **Environment variable management**: Gitignored `.env` files for local dev, a secrets manager (Vault, AWS Secrets Manager, Doppler) for production.
- **Targeted code review**: When reviewing AI-generated PRs, specifically grep for `= "`, `key:`, `secret`, `password`, and `token`. This is the one thing worth reviewing line by line.

## The Supabase gotcha

This deserves its own section because it's so consistently wrong. Supabase exposes two keys:

- **Anon key**: Safe for frontend code. Constrained by Row Level Security.
- **Service role key**: Bypasses ALL RLS rules. Admin-level access to every row in every table.

LLMs mix these up constantly. If your AI-generated app has the service role key in a client-side bundle — and we see this in roughly 1 in 8 Supabase projects we scan — anyone can bypass your entire security model with a single API call.

**Check your bundle.** Run `grep -r "service_role" src/` and `grep -r "supabase_service_role" dist/`. If it's there, rotate the key immediately.

## Stop trusting defaults

The pattern is identical across every breach: AI generates working code with placeholder credentials → developer doesn't change them → application ships with `"supersecretkey"` as its JWT secret.

Add secret scanning to your pipeline and this class of vulnerability disappears. The tools are free. The fix takes minutes. The breach it prevents takes months to clean up.

---

Kolega.dev scans your entire repo — including AI-generated files — for leaked API keys, tokens, and credentials. Detects patterns from LLM training data that generic scanners miss. [Scan for free →](https://kolega.dev)
