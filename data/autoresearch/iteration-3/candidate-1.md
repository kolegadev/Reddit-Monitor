---
title: "The 8 Most Common Vulnerabilities in AI-Generated Code"
subtitle: "What vibe coders keep shipping — and why traditional scanners keep missing them"
author: John
date: March 2026
readTime: "7 min read"
tags: ["AI security","vibe coding","vulnerabilities","SAST","application security"]
---

45% of AI-generated code fails security tests. That's a Veracode number from testing 100+ LLMs across 80 coding tasks. Security performance doesn't improve with model size. Bigger isn't safer.

The question isn't whether AI-generated code has vulnerabilities. It's which ones, and why your CI pipeline keeps letting them through.

## 1. Hardcoded Secrets

The fastest vulnerability to exploit. Invicti Security Labs generated 20,000 web apps with popular LLMs — 1,182 used `"supersecretkey"` as the JWT secret. LLMs have a set of favourite default values they reuse: `"supersecretkey"`, `"admin@example.com:password"`, `"user@example.com:password123"`.

They also mix up Supabase anon keys (safe with RLS enabled) and `service_role` keys (skip all security). This is how Lovable's CVE-2025-48757 happened — 303 endpoints with no row-level security across 170 projects. The AI generated the code. The default was insecure. Nobody checked.

**Check for:** Literal secret strings, hardcoded API keys in committed code, anon/service_role key confusion in Supabase/Firebase configs.

## 2. Injection (SQL, XSS, Command)

CodeRabbit found AI-written code is 2.74× more likely to contain XSS vulnerabilities than human-written code. The problem isn't complexity — it's training data. LLMs trained on GitHub, where string-concatenated SQL queries and `innerHTML` assignments are still common in tutorials and Stack Overflow answers.

The pattern: client-side validation exists, server-side validation doesn't. You can bypass the form and POST anything to the API directly. The AI generates the happy path. Attackers don't use the happy path.

**Check for:** String concatenation in queries, missing parameterized statements, `innerHTML` or `dangerouslySetInnerHTML`, unsanitized user input reaching database calls.

## 3. Authentication Theatre

Professional login forms. Password strength indicators. "Remember me" checkboxes. Looks production-ready. Behind the scenes: no server-side session validation, no token expiry, no role-based access control.

Lovable's platform-wide failure wasn't a bug — it was the default output. Supabase ships with Row Level Security disabled by default. The AI generated working auth *code* but didn't enable the auth *infrastructure*. Your users have passwords. Your database doesn't care.

**Check for:** Session/token validation on every protected endpoint, role checks on data access, RBAC enforcement — not just existence.

## 4. Supply Chain Blindness

19.7% of AI-suggested packages don't exist (Escape.tech, 2025). Of those, 58% are hallucinated names that appear consistently across multiple models. Attackers have noticed — one researcher uploaded an empty package called `huggingface-cli` (a common hallucination) and got 30,000 downloads in three months.

Your AI-generated codebase is pulling in dependencies you didn't choose, from sources you didn't vet. `package-lock.json` is a lie if the packages were hallucinated.

**Check for:** Every `import` and `require` — does the package exist? When was it last published? Who published it?

## 5. Missing Security Headers

Content-Security-Policy, X-Frame-Options, Strict-Transport-Security, X-Content-Type-Options — missing from the majority of AI-generated web applications. CORS policies default to `*` (allow all origins). The AI writes functional routes. Security headers are infrastructure. LLMs don't do infrastructure well.

**Check for:** CSP headers on every response, CORS restricted to actual origins, HSTS enabled, X-Content-Type-Options: nosniff.

## 6. Error Handling That Leaks

Verbose error messages, stack traces in production, debugging output exposed to end users. The AI generates functional error handling — `try/catch` blocks that log the error. What they don't do: sanitize the response before sending it to the client. Database schema names, file paths, internal IP addresses — all in the 500 response.

**Check for:** Generic error messages in production responses, no stack traces in client-facing output, structured error IDs for debugging instead of raw details.

## 7. Race Conditions and Logic Flaws

Tenzai used 5 AI tools to build 15 copies of the same app and found 69 security holes. SQL injection and XSS were handled reasonably well. Authorization logic failed every time — negative cart amounts, manipulated prices, resources accessed without ownership checks.

SAST tools look for dangerous functions. These bugs are missing functions. No `checkOwnership()` call where one should be. No price floor validation. No quantity cap. Pattern matching can't find something that isn't there.

**Check for:** Business logic validation independent of UI constraints, ownership checks on every resource mutation, atomic operations on financial/quantity fields.

## 8. No Server-Side Input Validation

Client-side forms validate everything. Server-side endpoints validate nothing. File uploads accepted without type or size checking, data constraints not enforced at the database or API layer, business rules only enforced in JavaScript.

If you disable JavaScript in your browser and submit the form, the server accepts it. That's a test you can run right now.

**Check for:** Server-side validation that mirrors or exceeds client-side checks, file type verification by content (not just extension), database constraints as a safety net.

## Why your scanners miss these

Traditional SAST tools look for patterns: known dangerous functions, deprecated APIs, regex matches on code. These eight vulnerabilities aren't pattern problems — they're architecture problems. The code is syntactically correct. The functions exist. The endpoints respond. But the security logic is incomplete or absent.

You can't grep for a missing ownership check. You can't lint for authorization theatre.

[Kolega.dev](https://kolega.dev) does semantic analysis — it understands what the code is *supposed* to do and checks whether it actually does it. In benchmarking against standard SAST tools, there's 0% overlap in findings. It catches the bugs that pattern matching systematically misses.

[Scan your repo for free →](https://kolega.dev)
