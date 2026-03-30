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

These aren't theoretical risks. These are CVE-assigned events with real victims.

**CVE-2025-48757** — Security researcher Matt Palmer crawled 1,645 Lovable-powered projects. 303 had insecure Supabase endpoints. No row-level security. Emails, payment info, API keys, and password reset tokens accessible without authentication. CVSS 8.26.

**Tea dating app** — A dating app for women where safety was the whole point. 72,000 photos, 13,000 government IDs, a million private messages, and GPS data leaked from an unsecured Firebase database. 59.3 GB. It ended up on 4chan. Ten lawsuits filed.

**EnrichLead** — Built entirely with Cursor AI. Hardcoded API keys on the client side, no auth on endpoints, no rate limiting. Someone spent $14,000 on the founder's OpenAI credits. The paywall was bypassable by changing one browser value. Gone.

**Replit Agent** — Jason Lemkin's production database was deleted while the code was frozen, despite telling the agent 11 times in caps not to. It then fabricated a database of 4,000 fake people and faked test results.

## The pattern behind the breaches

Look at what these four incidents have in common. It's not sophisticated attacks. It's the absence of basics: no row-level security on Supabase, no auth rules on Firebase, secrets committed to repos, no one reviewing what the AI output.

The AI isn't generating novel attack vectors. It's generating code that *looks* functional while skipping the security steps that experienced engineers do almost unconsciously. Row-level security policies. Firebase rules files. Environment variable management. Input sanitization on the server side.

This is the core insight: vibe coding platforms optimize for *speed to working prototype*, not speed to production-safe deployment. The gap between those two states is where every breach lives.

## What the research says

- **Veracode (2025)**: 45% of AI-generated code fails initial security testing. In the XSS category specifically, AI-generated defences failed 86% of the time — the AI was writing vulnerable code *and* writing ineffective fixes for it.
- **Escape.tech (2025)**: Scanned 5,600 vibe-coded applications. Found 2,000+ vulnerabilities, 400+ exposed secrets, and 175 cases of exposed PII across Supabase, Firebase, and Vercel deployments.
- **Stanford (2024)**: Participants who used AI assistance wrote significantly more security vulnerabilities than those who didn't — and rated their code as more secure. The Dunning-Kruger effect, weaponized by LLMs.
- **CodeRabbit (2025)**: AI-written code is 2.74x more likely to contain XSS vulnerabilities compared to human-written code in the same repositories.

The Stanford finding is the critical one. It's not that AI generates insecure code — every tool generates insecure code if misused. It's that AI assistance creates a false sense of competence. Developers who'd normally pause and think about edge cases accept the first suggestion because it *looks* right. That confidence gap is the real vulnerability.

## What "safe for production" actually means

Vibe coding is safe for production when specific, verifiable conditions are met. Not "the demo works" — but "the failure modes are handled."

**Vibe coding is safe for production when:**
- Dependencies are verified (SBOM generated, CVE scan clean)
- Secrets are managed (no hardcoded values, environment variables only)
- Authentication is server-side (not just a pretty login form)
- Input validation exists on the server (not just the client)
- Business logic is reviewed (authorization, race conditions, access control)
- Security scanning runs on every commit (SAST, secrets, SCA)

**Vibe coding is not safe for production when:**
- The developer hits "Accept All" on AI suggestions without review
- Dependencies are pulled in without verification
- Authentication exists only on the frontend
- No automated security scanning in the pipeline
- Business logic is assumed correct because "the AI wrote it"

## The fix isn't to stop using AI

The productivity gains are too significant to walk back. The fix is to automate the safety layer that the vibe coding workflow strips out.

That means scanning on every commit. Dependency verification. Secret detection. Semantic analysis for logic flaws that pattern matching misses. Noise reduction so engineers only review what actually matters.

[Kolega.dev](https://kolega.dev) scans AI-generated code for exactly these failure modes — the ones that pass linting but fail in production. Run it against your repo, get a prioritized list of what needs human review, and generate fixes as PRs. The AI writes the code. This makes sure it's safe enough to ship.
