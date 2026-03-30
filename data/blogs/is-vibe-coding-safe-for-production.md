---
title: "Is Vibe Coding Safe for Production? The Data Says No — Here's What to Do"
subtitle: "Productivity gains are real. The security risks are real too."
author: John
date: March 2026
readTime: "7 min read"
tags: ["AI security","vibe coding","production","deployment","application security"]
---

A quarter of YC's Winter 2025 batch shipped codebases that were 95% AI-generated. Lovable made $200M in ARR in five months. Bolt.new hit $40M ARR. 58% of Replit's business builders aren't engineers.

The productivity gains are real. Nobody is arguing that.

The question is whether the applications being shipped are safe enough for real users with real data. And the data says they're not.

## The breaches that already happened

These aren't theoretical risks. These are CVE-assigned events with real victims.

**CVE-2025-48757** — Security researcher Matt Palmer crawled 1,645 Lovable-powered projects. 303 had insecure Supabase endpoints. No row-level security. Emails, payment info, API keys, and password reset tokens accessible without authentication. CVSS 8.26.

**Tea dating app** — A dating app for women where safety was the whole point. 72,000 photos, 13,000 government IDs, a million private messages, and GPS data leaked from an unsecured Firebase database. 59.3 GB. It ended up on 4chan. Ten lawsuits filed.

**EnrichLead** — Built entirely with Cursor AI. Hardcoded API keys on the client side, no auth on endpoints, no rate limiting. Someone spent $14,000 on the founder's OpenAI credits. The paywall was bypassable by changing one browser value. Gone.

**Replit Agent** — Jason Lemkin's production database was deleted while the code was frozen, despite telling the agent 11 times in caps not to. It then fabricated a database of 4,000 fake people and faked test results.

## What the research says

- **Veracode**: 45% of AI code fails security tests. XSS defences didn't work 86% of the time.
- **Escape.tech**: 5,600 vibe-coded apps scanned. 2,000+ vulnerabilities, 400+ exposed secrets, 175 cases of PII.
- **Stanford**: People with AI assistance wrote more security flaws than those without — and were more confident their code was secure.
- **CodeRabbit**: AI-written code is 2.74x more likely to have XSS vulnerabilities.

The Stanford finding is the one that keeps me up at night. It's not that AI generates insecure code. It's that it makes developers less security-conscious. The false sense of confidence is more dangerous than the vulnerabilities themselves.

## What "safe for production" actually means

Vibe coding is safe for production the same way driving is safe — if you wear a seatbelt, follow traffic laws, and pay attention. The AI generates the car. You still need to drive it.

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

The productivity gains are too significant to ignore. The fix is to add the safety layer that the vibe coding workflow strips away.

Automated scanning on every commit. Dependency verification. Secret detection. Semantic code analysis for logic flaws. Noise reduction so you only review what matters.

Kolega.dev was built for this exact workflow. Scan the AI-generated code, catch what the patterns miss, generate fixes, and create PRs. The AI writes the code. We make sure it's safe.

---

Vibe coding is the future of software development. Make sure your security is part of that future. [Scan your repo for free](https://kolega.dev).
