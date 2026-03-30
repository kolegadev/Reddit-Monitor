---
title: "What Tools Actually Catch Vulnerabilities in AI-Generated Code?"
subtitle: "We tested the major categories against real vibe-coded applications. Here's what worked and what didn't."
author: John
date: March 2026
readTime: "7 min read"
tags: ["AI security","vibe coding","SAST","code scanning","application security"]
---

You already have SonarQube. You already run Dependabot. Maybe you added Semgrep last quarter. And yet your vibe-coded codebase still ships vulnerabilities that none of these tools catch.

This isn't a tooling problem in the traditional sense. Your scanners work — they catch SQL injection, hardcoded secrets, and known CVEs just fine. The problem is that AI-generated code fails in ways that traditional scanners weren't designed to detect.

Here's what actually works on AI-generated code, broken down by category.

## What traditional scanners catch (and where they fall short)

### SAST (Static Analysis Security Testing)
**Tools:** SonarQube, Semgrep, CodeQL, Checkmarx

**What they catch on AI code:**
- SQL injection (when the AI uses string concatenation instead of parameterized queries)
- XSS in template rendering
- Known dangerous function calls (eval, exec, innerHTML)

**What they miss:**
- Authorization logic gaps — the code is syntactically correct, the function exists, but it doesn't actually check permissions. Tenzai found that AI tools handled injection reasonably but failed authorization logic consistently.
- Business logic errors — negative cart quantities, price manipulation, resource access without ownership checks
- Semantic misunderstanding — the AI implements the right *pattern* but for the wrong *reason*, and pattern matching can't tell the difference

Veracode found that 45% of AI-generated code fails security tests. But the failures aren't evenly distributed — they cluster in the areas where pattern matching breaks down.

### SCA (Software Composition Analysis)
**Tools:** Dependabot, Snyk, Grype, Trivy

**What they catch on AI code:**
- Known CVEs in declared dependencies
- Outdated library versions

**What they miss:**
- Dependencies the AI implicitly introduced without declaring them
- 19.7% of AI-suggested packages don't exist at all — and SCA tools can't flag a package that isn't in the lockfile
- Package name hallucinations — the AI suggests "huggingface-cli" (a common hallucination across multiple models), and there's no dependency entry to scan

### Secret Scanning
**Tools:** Gitleaks, TruffleHog, GitGuardian

**What they catch on AI code:**
- Hardcoded API keys and tokens
- Credential files committed to the repo

**What they miss:**
- LLM default values that look like real secrets — "supersecretkey" isn't flagged because it doesn't match any known credential format
- Supabase key confusion — anon keys and service_role keys have the same format, scanners can't determine which should be where

## What actually works on AI-generated code

### Semantic Code Analysis

This is the category that matters most for vibe-coded code.

**How it works:** Instead of matching patterns, semantic analysis understands what the code is *supposed* to do and checks whether the implementation matches the intent. It traces data flows, verifies authorization paths, and validates business logic.

**Why it catches what SAST misses:**
- It understands that a payment endpoint should check quantity > 0, not just that quantity is a number
- It traces auth tokens from frontend through API to database, finding gaps where SAST only checks individual functions
- It detects when authorization checks exist in the code but are bypassed by the execution path

**The overlap problem:** Semantic analysis has 0% overlap with standard SAST tools. That's not a feature gap — it's a detection gap. If you're only running SAST, you're missing everything semantic analysis finds.

### Secret Detection with LLM Training Data Awareness

Standard secret scanners match regex patterns against known credential formats. What AI-generated code needs is a scanner that also recognizes patterns from LLM training data.

**What this looks like in practice:**
- Detecting "supersecretkey" and similar LLM defaults that aren't flagged by regex
- Identifying Supabase anon/service_role key placement errors
- Catching placeholder credentials from common tutorials (admin@example.com:password)

### Noise-Reduced Alerting

This isn't a scanner category — it's a workflow fix that makes all the other tools actually usable.

Here's the problem: 87% of SAST findings are false positives. Developers learn to ignore all of them, including the real ones. When you're generating code 5x faster with AI, the noise problem gets 5x worse.

Noise reduction groups identical violations into single tickets. It eliminates false positives by understanding code architecture. It turns 500 alerts into 15 that actually matter.

## The tool comparison

| Category | Traditional Tools | AI-Specific Tools | What They Miss |
|----------|------------------|-------------------|----------------|
| Pattern-based SAST | ✅ SonarQube, Semgrep | ⚠️ Partial | Authorization logic, business rules |
| SCA | ✅ Dependabot, Snyk | ⚠️ Partial | Implicit deps, hallucinated packages |
| Secret scanning | ✅ Gitleaks, TruffleHog | ⚠️ Needs LLM data awareness | Default values, key confusion |
| Semantic analysis | ❌ Not available | ✅ Kolega.dev | — |
| Noise reduction | ❌ Not available | ✅ Kolega.dev | — |
| Business logic | ❌ Not available | ✅ Kolega.dev Deep Scan | — |

The "AI-Specific Tools" column is sparse because most vendors haven't adapted their detection logic for AI-generated code. They're running the same rules they built for human-written code.

## What to actually run

**Minimum viable stack for vibe-coded code:**

1. **Secret scanner** — Gitleaks or TruffleHog (catches the easy stuff)
2. **SCA** — Snyk or Grype (catches known vulnerable dependencies)
3. **Semantic analysis** — catches what the above two miss entirely
4. **Noise reduction** — makes all three actually actionable

**Optional but valuable:**
- SBOM generation (Syft) — full dependency map including implicit ones
- API security testing (manual) — hit every endpoint directly, bypass the frontend

**What not to bother with:**
- Adding more SAST rules — you're already catching everything pattern matching can find
- Manual code review of every AI-generated line — it doesn't scale, and developers can't effectively review code they don't understand
- Trusting the AI's own security — Stanford found AI-assisted developers wrote *more* flaws and were *more* confident

## The bottom line

Traditional security tools were built for code written by humans who make human-style mistakes. AI-generated code fails differently — correct syntax implementing incorrect logic, implicit dependencies from training data, and patterns that look safe but aren't.

You don't need more scanners. You need scanners that understand what AI-generated code gets wrong. Kolega.dev's semantic analysis has 0% overlap with standard SAST because it catches fundamentally different classes of vulnerability. [Scan your repo for free](https://kolega.dev) and see what your current tools are missing.
