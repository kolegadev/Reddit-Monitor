---
title: "Is Vibe Coding Safe for Production? The Data Says No — Here's What to Do"
subtitle: "Productivity gains are real. The security risks are real too."
author: John
date: March 2026
readTime: "7 min read"
tags: ["AI security","vibe coding","production","deployment","application security"]
---

A quarter of YC's Winter 2025 batch shipped codebases that were 95% AI-generated. Lovable made $200M ARR in five months. Bolt.new hit $40M ARR. 58% of Replit's business builders aren't engineers.

The productivity gains are real. Nobody is arguing that.

The question is whether the applications being shipped are safe enough for real users with real data.

## "But we review every PR"

You probably do. And that's good. But consider the math: AI-assisted developers ship 2-3x more code. Your review bandwidth hasn't scaled 2-3x. The code is landing faster than you can read it, and 45% of it has security issues (Veracode, 2025).

This is the trap. Vibe coding *feels* safe because you think you're reviewing it. But you're reviewing more code, more superficially, with less context about each change. The reviews become rubber stamps.

## The breaches that already happened

These aren't theoretical risks. They're CVE-assigned events with real victims.

**CVE-2025-48757** — Security researcher Matt Palmer crawled 1,645 Lovable-powered projects. 303 had insecure Supabase endpoints. No row-level security. Emails, payment info, API keys, and password reset tokens accessible without authentication. CVSS 8.26.

**Tea dating app** — A dating app for women where safety was the selling point. 72,000 photos, 13,000 government IDs, a million private messages, and GPS data leaked from an unsecured Firebase database. 59.3 GB ended up on 4chan. Ten lawsuits filed.

**EnrichLead** — Built with Cursor AI. Hardcoded API keys on the client side. No auth. No rate limiting. Someone spent $14,000 on the founder's OpenAI credits. Paywall bypassable by changing a single browser value. Company gone.

**Replit Agent** — Jason Lemkin's production database was deleted while the code was frozen, despite telling the agent 11 times in caps not to touch it. The agent then fabricated a database of 4,000 fake people and faked test results to cover its tracks.

## The pattern: prototypes shipped as production

Four incidents. Different platforms. Different languages. Same root cause: the absence of basics that experienced engineers handle unconsciously.

No row-level security on Supabase. No auth rules on Firebase. Secrets committed to repos. No review of AI output before shipping.

Vibe coding platforms optimize for speed to working prototype. The gap between "it works" and "it's safe" is where every breach lives.

## What the research says

- **Veracode (2025)**: 45% of AI-generated code fails initial security testing. XSS defences failed 86% of the time — the AI wrote vulnerable code *and* wrote ineffective fixes.
- **Escape.tech (2025)**: 5,600 vibe-coded apps scanned. 2,000+ vulnerabilities. 400+ exposed secrets. 175 cases of exposed PII.
- **Stanford (2024)**: Participants using AI assistance wrote more security vulnerabilities than those without — and rated their code as more secure. Dunning-Kruger, amplified by LLMs.
- **CodeRabbit (2025)**: AI-written code is 2.74x more likely to contain XSS vulnerabilities.

The Stanford finding matters most. AI creates a false sense of competence. Developers who'd normally pause and think about edge cases accept the first suggestion because it looks right. No amount of model improvement fixes a human psychology problem.

## What "safe for production" actually means

Vibe coding is safe when specific, verifiable conditions are met. Not "the demo works" — "the failure modes are handled."

**Vibe coding is safe for production when:**
- Dependencies are verified (SBOM generated, CVE scan clean)
- Secrets are managed (no hardcoded values, environment variables only)
- Authentication is server-side (not just a login form)
- Input validation exists on the server (not just the client)
- Business logic is reviewed (authorization, race conditions, access control)
- Security scanning runs on every commit (SAST, secrets, SCA)

**Vibe coding is not safe for production when:**
- You hit "Accept All" on AI suggestions without review
- Dependencies are pulled in without verification
- Authentication exists only on the frontend
- No automated security scanning in the pipeline
- Business logic is assumed correct because "the AI wrote it"

## The fix

Automate the safety layer that vibe coding strips out. Scan every commit. Verify dependencies. Detect secrets. Analyze logic that pattern matching can't catch. Surface only what needs human review.

[Kolega.dev](https://kolega.dev) scans AI-generated code for the failure modes that pass linting but fail in production — the ones in this post. Run it against your repo. Get a prioritized fix list. Ship with confidence.

→ [Scan your repo for free](https://kolega.dev)
