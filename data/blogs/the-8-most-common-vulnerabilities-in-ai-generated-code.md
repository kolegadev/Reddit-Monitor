---
title: "The 8 Most Common Vulnerabilities in AI-Generated Code"
subtitle: "What vibe coders keep shipping — and why traditional scanners keep missing them"
author: John
date: March 2026
readTime: "7 min read"
tags: ["AI security","vibe coding","vulnerabilities","SAST","application security"]
---

45% of AI-generated code fails security tests. That's not a controversial opinion — it's a Veracode number from testing 100+ LLMs across 80 coding tasks. The security performance doesn't improve with model size either. Bigger isn't safer.

The question isn't whether AI-generated code has vulnerabilities. It's which ones, and why they keep getting through.

## 1. Hardcoded Secrets

The fastest vulnerability to exploit. Invicti Security Labs generated 20,000 web apps with popular LLMs — 1,182 used "supersecretkey" as the JWT secret. LLMs have a set of favourite default values that they reuse constantly: "supersecretkey", "admin@example.com:password", "user@example.com:password123".

They also mix up Supabase anon keys (safe with RLS enabled) and service_role keys (skip all security). This is how Lovable's CVE-2025-48757 happened — 303 endpoints with no row-level security across 170 projects.

## 2. Injection (SQL, XSS, Command)

CodeRabbit found that AI-written code is 2.74x more likely to contain XSS vulnerabilities than human-written code. The issue isn't complexity — it's that LLMs train on GitHub, where string-concatenated SQL queries are still common in tutorials and examples.

Client-side validation exists. Server-side validation doesn't. You can bypass the form and send anything to the API directly.

## 3. Authentication Theatre

Professional login forms. Password strength indicators. "Remember me" checkboxes. Looks great. Behind the scenes: no server-side auth, no session validation, no role-based access control.

Lovable's platform-wide failure wasn't a bug — it was the default output. Supabase turns off Row Level Security by default, and the AI didn't turn it on.

## 4. Supply Chain Blindness

19.7% of AI-suggested packages don't exist. Of those, 58% are hallucinated names that appear consistently across multiple models. Attackers have noticed — one researcher uploaded an empty package called "huggingface-cli" (a common hallucination) and got 30,000 downloads in three months.

Your AI-generated codebase is pulling in dependencies you didn't choose, from sources you didn't vet.

## 5. Missing Security Headers

Content-Security-Policy, X-Frame-Options, Strict-Transport-Security, X-Content-Type-Options — these headers are missing from the majority of AI-generated web applications. Misconfigured CORS policies allow all origins.

## 6. Error Handling That Leaks

Verbose error messages, stack traces in production, debugging output exposed to end users. The AI generates functional error handling — it just doesn't follow security best practices around information disclosure.

## 7. Race Conditions and Logic Flaws

Tenzai used 5 AI tools to build 15 copies of the same app and found 69 security holes. SQL injection and XSS were handled well. Authorization logic failed every time — negative cart amounts, prices manipulated, resources accessed without ownership checks.

Pattern matching can't find these. You need to understand what the code is supposed to do.

## 8. No Input Validation on the Server

Client-side forms validate everything. Server-side endpoints validate nothing. File uploads accepted without type checking, data constraints not enforced, business logic not validated.

## Why scanners miss these

Traditional SAST tools look for patterns. These vulnerabilities aren't pattern problems — they're architecture problems. The code looks syntactically correct. The functions exist. The endpoints respond. But the security logic is incomplete or absent.

Kolega.dev's deep code scan was built for exactly this gap — semantic analysis that understands code intent, not just syntax. 0% overlap with standard SAST means it catches the vulnerabilities that other tools systematically miss.

---

The vulnerabilities aren't surprising. What's surprising is how many teams ship AI-generated code without any of these checks. The tools exist. The question is whether you're running them on the code your AI is writing.

[Scan your repo for free](https://kolega.dev) and see what's hiding in your AI-generated code.
