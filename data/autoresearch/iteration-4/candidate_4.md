---
title: "How to Audit Vibe-Coded Applications for Security"
subtitle: "A practical audit framework for code you didn't write — and might not understand"
author: John
date: March 2026
readTime: "10 min read"
tags: ["AI security","vibe coding","security audit","code review","application security"]
---

Your team shipped a feature in two hours. Nobody wrote the code — they prompted for it, iterated on the output, and merged it. It works. But does anyone know what it actually does?

That's the vibe coding security problem. Across r/vibecoding and r/cybersecurity, the same concern keeps surfacing: AI-generated code looks correct, passes review, and ships — but the people approving it often don't understand the dependencies, data flows, or failure modes.

Here's how to audit it.

## Phase 1: Automated scanning (30 minutes)

Don't read code yet. Run automated tools first — they catch the vulnerabilities that exist regardless of authorship, and they're critical for vibe-coded apps because the developer may not have caught them either.

**1. Dependency verification.** Generate an SBOM (`syft`, `cyclonedx`). Verify every package exists. LLMs hallucinate package names — `python-request` instead of `requests`, or entirely fictional libraries. A hallucinated dependency creates a silent runtime failure or, worse, a dependency confusion attack if someone publishes a malicious package with that name. Then CVE-scan the verified list.

**2. Secret detection.** Run `gitleaks` or `trufflehog` against the full repo. Check API keys, database credentials, JWT secrets, cloud tokens. LLMs trained on public code sometimes reproduce real credentials from their training data. Scan `.env.example`, Dockerfiles, and CI/CD configs too.

**3. SAST.** Run Semgrep or Trivy for injection (SQL, command, LDAP), insecure deserialization, path traversal. The catch: SAST tools produce high false-positive rates on AI-generated code because they flag suspicious patterns without architectural context. When your team dismisses most findings as noise, real vulnerabilities get dismissed too. Kolega.dev solves this by understanding your code's architecture and grouping identical violations into single tickets — turning a flood of alerts into a prioritized fix list.

## Phase 2: Manual review (2-4 hours)

**4. Trace data flows.** Pick the most sensitive data in your app — PII, payment info, auth tokens. Trace it: input → processing → storage. Is it logged anywhere? Included in error responses? Passed to third-party APIs? For vibe-coded apps, check intermediate steps specifically. The LLM might store raw input in a session, log it for debugging, and forward it to an external service — three exposures the prompter never considered.

**5. Bypass the UI and test the API directly.** The single most important manual check. Use `curl` or Postman to hit every endpoint without the frontend. LLMs routinely implement auth on the client (a login form checking locally) while leaving the API wide open. r/cybersecurity threads document this pattern repeatedly.

Then test for IDOR: authenticate as one user, change the user ID in the request, and check if you can access another user's resources. LLMs implement "get resource by ID" without adding "verify the requester owns this resource" — making IDOR endemic in vibe-coded apps.

**6. Test authorization at boundaries.** Create accounts with different roles. Hit admin endpoints as a regular user. Access other users' data. Enumerate IDs sequentially. Test edge-case inputs: negative quantities, 10MB JSON payloads, deeply nested objects. Authorization requires business logic that the LLM doesn't have — this is where vibe-coded apps fail most often.

## Phase 3: Configuration

**7. Security headers.** Content-Security-Policy, X-Frame-Options, X-Content-Type-Options, Strict-Transport-Security, Referrer-Policy. AI-generated web apps routinely omit these.

**8. CORS.** Verify explicit origins. Wildcard CORS with credentials enabled is a critical misconfiguration that LLMs ship by default.

**9. Error handling.** Trigger errors and check for stack traces, schema details, file paths, framework versions.

**10. Rate limiting.** Hammer your auth endpoint — 100 attempts in 10 seconds. If they all go through, there's no brute-force protection.

## Audit checklist

- [ ] SBOM generated, all packages verified to exist, CVE scan clean
- [ ] No hardcoded secrets (source, `.env`, Docker, CI/CD)
- [ ] SAST clean: injection, deserialization, path traversal
- [ ] Sensitive data flows traced end-to-end
- [ ] All API endpoints tested without frontend
- [ ] IDOR tested across user boundaries
- [ ] Security headers present (CSP, X-Frame-Options, HSTS)
- [ ] CORS locked to explicit origins
- [ ] Error responses sanitized
- [ ] Rate limiting on auth endpoints
- [ ] Server-side input validation on all user inputs
- [ ] File uploads hardened (type check, size limit, path traversal)

## Why vibe-coded audits differ

Three things make these audits distinct from traditional code review:

1. **Visual inspection is unreliable.** The code is clean, well-commented, syntactically valid. But comments describe what the LLM *intended*, not what it implemented. You must test behavior, not read prose.

2. **The dependency chain is unknown.** The developer who accepted the AI's suggestions can't explain why a library was chosen, whether it's maintained, or if it even exists. Hallucinated packages compound this — you may be depending on software that doesn't exist.

3. **Authorization is the blind spot.** LLMs handle authentication (who are you?) adequately — it follows clear patterns. Authorization (what can you do?) requires understanding business rules they don't have. Result: apps where login works perfectly, but any authenticated user can access any resource.

## Tools

| Category | Open source | Kolega.dev |
|---|---|---|
| SBOM | `syft`, `cyclonedx` | ✅ Dependency mapper |
| Secrets | `gitleaks`, `trufflehog` | ✅ Built-in detection |
| SAST | Semgrep, Trivy | ✅ Multi-engine Tier 1 |
| Semantic analysis | — | ✅ Deep Code Scan |
| Noise reduction | — | ✅ Architecture-aware grouping |

Business logic and authorization testing remain manual. No tool fully automates "should this user be able to do this?"

---

Kolega.dev runs all five scan categories in one pass with architecture-aware noise reduction, so you review what matters instead of drowning in false positives. [Scan your vibe-coded repo for free](https://kolega.dev).
