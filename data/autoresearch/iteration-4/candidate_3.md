---
title: "How to Audit Vibe-Coded Applications for Security"
subtitle: "A practical audit framework for code you didn't write — and might not understand"
author: John
date: March 2026
readTime: "10 min read"
tags: ["AI security","vibe coding","security audit","code review","application security"]
---

Your team shipped a feature in two hours. Nobody wrote the code — they prompted for it, iterated on the output, and merged it. It works. But does anyone on the team know what it actually does?

That's the vibe coding security problem. Across r/vibecoding and r/cybersecurity, developers are raising the same concern: AI-generated code looks correct, passes code review, and ships to production — but the people approving it often don't understand the dependencies, the data flows, or the failure modes.

Here's how to audit it anyway.

## Phase 1: Automated scanning (30 minutes)

Don't read code yet. Automated tools catch vulnerabilities that exist regardless of who wrote the code — but they're critical for vibe-coded apps because the developer may not have noticed them either.

**1. Dependency verification.** Generate an SBOM with `syft` or `cyclonedx`. Then verify every package actually exists. LLMs hallucinate package names — they'll suggest `python-request` instead of `requests`, or invent fictional libraries entirely. A hallucinated dependency means either a silent runtime failure or, worse, a dependency confusion attack surface if someone later publishes a malicious package with that name. Run a CVE scan against verified dependencies.

**2. Secret detection.** Scan with `gitleaks` or `trufflehog`. Check API keys, database credentials, JWT secrets, and cloud provider tokens. LLMs trained on public code will sometimes reproduce real credentials from their training data. Also check `.env.example` files, Docker configs, and CI/CD pipelines.

**3. Static analysis (SAST).** Run Semgrep or Trivy for injection vulnerabilities (SQL, command, LDAP), insecure deserialization, and path traversal. The caveat: most SAST tools generate high false-positive rates on AI-generated code because they flag patterns that look suspicious but are harmless in context. That's the signal-killing problem — when your team dismisses most findings as noise, the real vulnerabilities get dismissed too. Kolega.dev handles this by understanding your code architecture and grouping identical violations into single actionable tickets instead of flooding your backlog.

## Phase 2: Manual security review (2-4 hours)

Automation catches patterns. Manual review catches everything else.

**4. Trace data flows for sensitive data.** Pick the most sensitive data type in your app (PII, payment info, auth tokens). Trace it from input to storage: where does it enter? What transforms it? Where does it persist? Is it logged? Is it in error responses?

For vibe-coded apps specifically, check intermediate processing. An LLM might store raw input in a session, log it for debugging, and pass it to a third-party API — each step creating exposure the prompter never considered.

**5. Bypass the UI — test the API directly.** This is the most important manual check. Use `curl` or Postman to hit every endpoint without the frontend. LLMs frequently implement authentication on the client (a login form that checks locally) while leaving the API unprotected. Multiple threads on r/cybersecurity document this exact pattern: a working login page, zero middleware protecting the routes.

Then test for IDOR: get a valid session, change the user ID in the URL, and see if you can access another user's data. IDOR is endemic in vibe-coded apps because LLMs implement "get user by ID" without adding "verify the requester owns this resource."

**6. Test authorization boundaries.** Create accounts with different roles (admin, regular user, unauthenticated). Try admin endpoints as a regular user. Try modifying other users' data. Try sequential ID enumeration. Test with edge-case inputs: negative quantities, oversized payloads, nested JSON.

## Phase 3: Configuration and infrastructure

**7. Security headers.** Check for Content-Security-Policy, X-Frame-Options, X-Content-Type-Options, Strict-Transport-Security, Referrer-Policy. AI-generated web apps often omit these entirely.

**8. CORS.** Verify origins are explicitly listed. A wildcard CORS policy with credentials enabled is a critical misconfiguration that LLMs ship by default.

**9. Error handling.** Trigger errors and inspect responses. Stack traces, database schemas, file paths, and framework versions in error responses are attack intelligence.

**10. Rate limiting.** Send 100 login attempts in 10 seconds against your auth endpoint. If they all process, the LLM didn't implement brute-force protection.

## Audit checklist

- [ ] SBOM generated, all packages verified to exist, CVE scan clean
- [ ] No hardcoded secrets in source, `.env`, Docker, or CI/CD
- [ ] SAST clean: injection, deserialization, path traversal
- [ ] Sensitive data flows traced end-to-end
- [ ] All API endpoints tested without frontend (auth + authorization)
- [ ] IDOR tested across user boundaries
- [ ] Security headers present (CSP, X-Frame-Options, HSTS)
- [ ] CORS locked to explicit origins
- [ ] Error responses sanitized (no stack traces)
- [ ] Rate limiting on auth endpoints
- [ ] Server-side input validation
- [ ] File upload hardening (type, size, path traversal)

## Why vibe-coded audits are different

**The code looks right but might not be.** LLMs produce clean, well-commented, syntactically valid code. But the comments describe what the model thinks the code does, not what it actually does. Visual inspection is unreliable — you need to test behavior, not read prose.

**The developer doesn't know the dependencies.** The person who accepted the AI's suggestions likely can't explain why a particular library was chosen or whether it's maintained. Hallucinated packages make this worse — you're depending on software that may not exist.

**Authorization is the blind spot.** LLMs handle authentication (who are you?) reasonably well — it has clear patterns. Authorization (what can you do?) requires business logic they don't have access to. This creates apps where login works perfectly but any authenticated user can access any resource.

## Tools

| Category | Open source | Kolega.dev |
|---|---|---|
| SBOM | `syft`, `cyclonedx` | ✅ Dependency mapper |
| Secrets | `gitleaks`, `trufflehog` | ✅ Built-in detection |
| SAST | Semgrep, Trivy | ✅ Multi-engine Tier 1 |
| Semantic analysis | — | ✅ Deep Code Scan |
| False positive reduction | — | ✅ Architecture-aware grouping |

Business logic and authorization testing remain manual. No tool fully automates "should this user be able to do this?"

---

Kolega.dev runs all five categories in one scan with architecture-aware noise reduction. [Scan your vibe-coded repo for free](https://kolega.dev).
