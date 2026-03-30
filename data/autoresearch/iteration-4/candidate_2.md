---
title: "How to Audit Vibe-Coded Applications for Security"
subtitle: "A practical audit framework for code you didn't write — and might not understand"
author: John
date: March 2026
readTime: "10 min read"
tags: ["AI security","vibe coding","security audit","code review","application security"]
---

Your team shipped a feature in two hours. Nobody wrote the code — they prompted for it, iterated on the output, and merged it. It works. But does anyone on the team know what it actually does?

That's the vibe coding security problem in one paragraph. Across r/vibecoding and r/cybersecurity, developers are raising the same concern: AI-generated code looks correct, passes code review, and ships to production — but the people approving it often don't understand the dependencies, the data flows, or the failure modes.

Here's a framework for auditing it anyway.

## Phase 1: Automated scanning (30 minutes)

Start here. Don't read code yet. Automated tools catch the vulnerabilities that exist regardless of whether a human or an LLM wrote the code — but they're especially important for vibe-coded apps because the developer may not have noticed them either.

**1. Dependency verification.** Generate an SBOM with `syft` or `cyclonedx`. Then verify every package actually exists. LLMs hallucinate package names — they'll suggest `python-request` instead of `requests`, or invent entirely fictional libraries. A hallucinated dependency means either a silent failure at runtime or, worse, a dependency confusion attack surface if someone publishes a malicious package with that name later.

Run a CVE scan against verified dependencies. Prioritize criticals and high-severity findings that affect network-exposed code paths.

**2. Secret detection.** Scan with `gitleaks` or `trufflehog`. Check for API keys, database credentials, JWT secrets, and cloud provider tokens. LLMs trained on GitHub will reproduce real credentials from their training data — not often, but often enough to matter. Also check `.env.example` files, Docker configs, and CI/CD pipeline definitions.

**3. Static analysis.** Run SAST with Semgrep or Trivy. Focus on injection vulnerabilities (SQL, command, LDAP), insecure deserialization, and path traversal. The critical caveat: most SAST tools generate 80%+ false positives on AI-generated code because they can't distinguish between real vulnerabilities and the AI's tendency to use patterns that look suspicious but are harmless. That's the signal-killing problem — if your team is dismissing 8 out of 10 findings, the 2 real ones get dismissed too. Kolega.dev addresses this by understanding code architecture and grouping identical violations into single actionable tickets.

## Phase 2: Manual security review (2-4 hours)

Automation handles pattern matching. Manual review handles everything else.

**4. Trace data flows end-to-end.** Pick the most sensitive data type in your app (user PII, payment info, auth tokens). Trace it from input to storage: where does it enter? What transforms it? Where does it persist? Is it logged anywhere? Is it included in error responses?

For vibe-coded apps, pay attention to intermediate processing steps. An LLM might store raw user input in a session, log it to a file for debugging, and pass it to a third-party API — each creating an exposure the original prompter never considered.

**5. Bypass the UI and test the API directly.** This is the single most important manual check. Use `curl`, Postman, or `httpie` to hit every endpoint without going through the frontend. LLMs frequently implement authentication on the client side (a login form that checks credentials locally) while leaving the API completely open.

Concrete test: get a valid session token, then try accessing another user's resources by changing the user ID in the URL or request body. If it works, you have an IDOR vulnerability — and this is endemic in vibe-coded apps because LLMs don't automatically implement per-resource authorization checks.

**6. Test authorization boundaries.** Create test accounts with different roles (admin, regular user, unauthenticated). Try accessing admin endpoints as a regular user. Try modifying other users' data. Try accessing resources by incrementing IDs sequentially. Test input validation by sending negative quantities, extremely long strings, and nested JSON payloads.

## Phase 3: Configuration and infrastructure

**7. Security headers.** Check for Content-Security-Policy, X-Frame-Options, X-Content-Type-Options, Strict-Transport-Security, and Referrer-Policy. AI-generated web apps often omit these entirely.

**8. CORS configuration.** Verify origins are explicitly listed. A wildcard CORS policy (`Access-Control-Allow-Origin: *`) with credentials enabled is a critical misconfiguration.

**9. Error handling.** Trigger errors and check what the response contains. Stack traces, database schemas, file paths, and framework versions in error responses are intelligence for attackers.

**10. Rate limiting.** Test auth endpoints for brute-force protection. Send 100 login attempts in 10 seconds. If they all go through, the LLM didn't implement rate limiting.

## The audit checklist

- [ ] SBOM generated, all packages verified to exist, CVE scan clean
- [ ] No hardcoded secrets (source, `.env`, Docker, CI/CD)
- [ ] SAST scan clean for injection, deserialization, path traversal
- [ ] Data flows traced for sensitive data types
- [ ] All API endpoints tested without frontend (auth + authorization)
- [ ] IDOR tested: User A cannot access User B's resources
- [ ] Security headers present (CSP, X-Frame-Options, HSTS)
- [ ] CORS locked to specific origins
- [ ] Error responses contain no stack traces or internal details
- [ ] Rate limiting present on auth endpoints
- [ ] Input validation enforced server-side
- [ ] File uploads: type check, size limit, path traversal prevention

## Why vibe-coded apps need different audits

Three things make vibe-coded apps uniquely risky:

1. **The confidence gap.** The code looks good. It's well-formatted, well-commented, syntactically correct. But the comments describe what the LLM thinks the code does, not what it actually does. Visual code review is nearly useless.

2. **The dependency blind spot.** The developer who accepted the AI's suggestions doesn't know why a particular library was chosen, what alternatives exist, or whether it's maintained. Hallucinated packages compound this — you're trusting software that may not exist.

3. **The authorization assumption.** LLMs implement authentication (who are you?) more reliably than authorization (what can you do?). The former has clear patterns. The latter requires understanding business logic that the LLM doesn't have access to.

## Tools

| Category | Tools |
|---|---|
| SBOM | `syft`, `cyclonedx` |
| Secrets | `gitleaks`, `trufflehog` |
| SAST | Semgrep, Trivy |
| Deep analysis | [Kolega.dev](https://kolega.dev) — dependency mapping, secret detection, SAST, semantic analysis, false positive reduction |

Business logic testing remains manual. No tool can fully automate "should a user be able to do this?"

---

Kolega.dev runs all five scan categories in one pass — dependency verification, secret detection, SAST, semantic analysis, and architectural noise reduction. [Scan your vibe-coded repo for free](https://kolega.dev).
