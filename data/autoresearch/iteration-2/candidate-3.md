---
title: "How to Secure AI-Generated Code Before It Ships"
subtitle: "The pre-deployment security checklist that vibe coders skip"
author: John
date: March 2026
readTime: "8 min read"
tags: ["AI security","vibe coding","code review","deployment","application security"]
---

The fastest way to ship a vulnerability is to skip security review. Vibe coding makes this easier than ever — the code compiles, the tests pass, and the feature works. So it ships. But "works" and "secure" are not the same thing.

This came up across r/vibecoding and r/webdev last month. Developers shipping AI-generated applications are hitting the same wall: development speed outpaces security validation. A user on r/vibecoding described shipping an AI-built SaaS tool in two days, only to discover a week later that every user's data was accessible to every other user. No auth check on the API. The login page worked. The actual security didn't.

Here's what catches these vulnerabilities before they reach production.

## Run the scanners your CI already has — but actually read the results

Most teams have SAST tools in CI but nobody reads them. The problem isn't the scanner — it's the noise. When 87% of findings are false positives (Snyk, 2025 State of Open Source Security), developers learn to ignore the entire output. Real vulnerabilities hide in the firehose.

The fix is noise reduction. Group 50 instances of the same violation into one ticket, one PR, one decision. Kolega.dev eliminates ~90% of scanner noise so you only review what actually matters. If your scanner output is a wall of warnings nobody reads, that's a tooling problem, not a security culture problem.

## Verify every dependency actually exists

AI-generated code pulls patterns from millions of repositories. When a model suggests `npm install some-obscure-package`, it might be hallucinating — researchers at the University of Texas found 19.7% of AI-suggested packages don't exist (Bao et al., 2024). Attackers now squat on these hallucinated names. A package the model "remembered" from training data might have been registered by someone malicious after the fact.

Before deployment:
- Generate a full SBOM
- Run SCA tools against every dependency
- Verify each package exists on the real registry (not just in the model's training data)
- Check maintainer activity and known CVEs

## Scan for secrets in every commit — including the AI's

LLMs have favourite default values. Invicti Security Labs tested 20,000 AI-generated web apps and found "supersecretkey" as the JWT secret in 1,182 of them. Hardcoded API keys, database credentials, and tokens are the single most common vulnerability class in vibe-coded applications.

Run secret scanning on every commit — not just the ones you wrote. Check for:
- Hardcoded API keys and tokens
- Default JWT secrets from training data patterns
- Database credentials embedded in config files
- Values that look like LLM-generated placeholders ("your-api-key-here")

## Don't trust the login form — test auth via API

AI tools build login flows that look professional. What's behind them is often nothing. The CVE-2025-48757 disclosure found 303 insecure Supabase endpoints across 170 projects built with AI tools — no row-level security, no authentication on API routes, public anon keys bundled with every frontend.

The login form is cosmetic until you verify:
- Server-side auth exists (not just client-side validation)
- Row Level Security is enabled on every database table with sensitive data
- Session tokens are validated server-side on every request
- Role-based access control is enforced at the API level, not the UI level

## Check business logic, not just syntax

SAST tools catch SQL injection and XSS. They don't catch what the Tenzai study identified as AI's consistent failure: authorization logic. Negative cart amounts, manipulable prices, resources accessible without ownership checks — these are logic flaws, not injection flaws.

Pattern matching won't find them. You need semantic analysis that understands what the code is supposed to do and finds where it doesn't. Kolega.dev's deep code scan has 0% overlap with standard SAST tools — it catches the category of vulnerabilities that conventional scanners are architecturally incapable of detecting.

## Set security headers and lock CORS

Often skipped in AI-generated code because models don't always include them and developers don't think to check:

- **Content-Security-Policy** — restricts what scripts and resources the page can load
- **X-Frame-Options** — prevents clickjacking
- **Strict-Transport-Security** — enforces HTTPS
- **CORS** — locked to your specific origins, not `*`

These aren't exotic. They're baseline. But they're missing from a surprising number of AI-generated deployments because no one remembers to add them.

## The problem with checklists

You've seen security checklists before. You've probably ignored them before — and with good reason. Most are a hundred items long, half are irrelevant to your stack, and there's no tooling to actually run them. They're aspirational, not operational.

This one is different for one reason: every item above maps to something an automated scanner can catch in minutes. You don't need a security expert on staff. You need the right tool configured correctly.

Kolega.dev runs all of these checks automatically — SAST noise reduction, SCA, secret detection, semantic business logic analysis — and generates fixes. [Scan your repo for free](https://kolega.dev) and see what your AI-generated code actually shipped.
