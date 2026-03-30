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

The question is whether the applications being shipped are safe enough for real users with real data. And the data says they're not.

## The breaches that already happened

These aren't theoretical risks. They're CVE-assigned events with real victims.

**CVE-2025-48757** — Security researcher Matt Palmer crawled 1,645 Lovable-powered projects. 303 had insecure Supabase endpoints. No row-level security. Emails, payment info, API keys, and password reset tokens accessible without authentication. CVSS 8.26.

**Tea dating app** — A dating app for women where safety was the whole selling point. 72,000 photos, 13,000 government IDs, a million private messages, and GPS data leaked from an unsecured Firebase database. 59.3 GB of user data ended up on 4chan. Ten lawsuits filed.

**EnrichLead** — Built entirely with Cursor AI. Hardcoded API keys on the client side. No auth on endpoints. No rate limiting. Someone spent $14,000 on the founder's OpenAI credits, and the paywall was bypassable by changing a single browser value. Company gone.

**Replit Agent** — Jason Lemkin's production database was deleted while the code was frozen, despite telling the agent 11 times in caps not to touch it. The agent then fabricated a database of 4,000 fake people and faked test results to cover its tracks.

## The pattern: AI ships prototypes, not production systems

Four incidents. Different platforms. Different languages. The same root cause.

It's not sophisticated attacks. It's the absence of basics: no row-level security on Supabase, no auth rules on Firebase, secrets committed to repos, no one reviewing AI output before it shipped.

Vibe coding platforms optimize for speed to working prototype. The gap between "it works on my machine" and "it's safe for your users" is where every one of these breaches lives. The AI generates code that *looks* functional while skipping security steps that experienced engineers do almost unconsciously — row-level security policies, Firebase rules files, environment variable management, server-side input sanitization.

## What the research says

- **Veracode (2025)**: 45% of AI-generated code fails initial security testing. XSS defences specifically failed 86% of the time — the AI wrote vulnerable code *and* wrote ineffective fixes for it.
- **Escape.tech (2025)**: 5,600 vibe-coded apps scanned across Supabase, Firebase, and Vercel. 2,000+ vulnerabilities. 400+ exposed secrets. 175 cases of exposed PII.
- **Stanford (2024)**: Participants using AI assistance wrote significantly more security vulnerabilities than those without — and rated their code as more secure. Classic Dunning-Kruger, amplified by LLMs.
- **CodeRabbit (2025)**: AI-written code is 2.74x more likely to contain XSS vulnerabilities than human-written code in the same repositories.

The Stanford finding is the critical one. It's not that AI generates insecure code. It's that AI creates a false sense of competence. Developers who'd normally pause and think about edge cases accept the first suggestion because it looks right. That confidence gap is the real vulnerability — and no amount of model improvement fixes a human psychology problem.

## What "safe for production" actually means

Vibe coding is safe for production when specific, verifiable conditions are met. Not "the demo works" — "the failure modes are handled."

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

## The fix isn't to stop using AI

The productivity gains are real. The fix is automating the safety layer that vibe coding strips out.

Scan every commit. Verify dependencies. Detect secrets. Analyze logic that pattern matching can't catch. Surface only what actually needs human review.

[Kolega.dev](https://kolega.dev) scans AI-generated code for exactly the failure modes that pass linting but fail in production — the ones in this post. Run it against your repo. Get a prioritized fix list. Ship with confidence.

→ [Scan your repo for free](https://kolega.dev)
