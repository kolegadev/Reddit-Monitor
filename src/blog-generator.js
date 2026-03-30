/**
 * Blog Generator for Reddit-Monitor
 * 
 * Converts Reddit Q&A responses into kolega.dev-style blog posts.
 * Style: direct, data-driven, technical but accessible, no fluff.
 * Uses real security incidents, research papers, and concrete examples.
 */

const fs = require('fs');
const path = require('path');
const { getDb } = require('./db');

const DATA_DIR = path.join(__dirname, '..', 'data');
const BLOG_DIR = path.join(DATA_DIR, 'blogs');

class BlogGenerator {
  constructor() {
    this.db = getDb();
    if (!fs.existsSync(BLOG_DIR)) fs.mkdirSync(BLOG_DIR, { recursive: true });
  }

  /**
   * Generate a blog post from collected Reddit responses
   */
  generateFromResponses(queryId) {
    const query = this.db.prepare('SELECT * FROM queries WHERE id = ?').get(queryId);
    if (!query) throw new Error(`Query ${queryId} not found`);

    const responses = this.db.prepare('SELECT * FROM responses WHERE query_id = ?').all(queryId);
    const followups = this.db.prepare('SELECT * FROM followup_questions WHERE query_id = ?').all(queryId);

    if (responses.length === 0) throw new Error('No responses to generate blog from');

    // Pick the main curated answer (or the longest response)
    const mainAnswer = responses.find(r => r.curated_answer && r.curated_answer.length > 200)
      || responses.reduce((a, b) => (a.question?.length || 0) > (b.question?.length || 0) ? a : b);

    const blog = this.buildBlog(query, responses, followups, mainAnswer);
    return blog;
  }

  /**
   * Generate blogs for all queries that don't have one yet
   */
  generateAll() {
    const unblogged = this.db.prepare(`
      SELECT q.* FROM queries q
      WHERE q.status = 'completed' AND q.id NOT IN (
        SELECT CAST(value AS INTEGER) FROM blogs, json_each(blogs.response_ids)
      )
    `).all();

    const results = [];
    for (const q of unblogged) {
      try {
        const blog = this.generateFromResponses(q.id);
        const saved = this.saveBlog(blog);
        results.push({ queryId: q.id, title: blog.title, slug: blog.slug, saved });
      } catch (e) {
        results.push({ queryId: q.id, error: e.message });
      }
    }
    return results;
  }

  buildBlog(query, responses, followups, mainAnswer) {
    const topic = query.query_text;

    // Build the blog in kolega.dev style
    const title = this.generateTitle(topic, responses);
    const subtitle = this.generateSubtitle(topic);
    const author = 'John';
    const readTime = this.estimateReadTime(responses);
    const slug = this.generateSlug(topic, title);

    // Extract key themes from responses
    const themes = this.extractThemes(responses);

    const content = this.renderBlog({
      title,
      subtitle,
      author,
      readTime,
      topic,
      themes,
      responses,
      followups,
      mainAnswer,
      date: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    });

    return {
      title,
      subtitle,
      slug,
      author,
      readTime,
      content,
      responseIds: responses.map(r => r.id),
      queryId: query.id,
      tags: this.generateTags(topic, themes),
      date: new Date().toISOString()
    };
  }

  renderBlog({ title, subtitle, author, readTime, topic, themes, responses, followups, mainAnswer, date }) {
    // Parse the main answer if it's the OCR'd markdown
    let sections = [];
    const answer = mainAnswer.curated_answer;
    if (answer && answer.includes('## ')) {
      sections = this.parseMarkdownSections(answer);
    } else {
      sections = this.buildSectionsFromResponses(responses, themes);
    }

    let md = '';
    md += `---\n`;
    md += `title: "${title}"\n`;
    md += `subtitle: "${subtitle}"\n`;
    md += `author: ${author}\n`;
    md += `date: ${date}\n`;
    md += `readTime: "${readTime} min read"\n`;
    md += `tags: ${JSON.stringify(this.generateTags(topic, themes))}\n`;
    md += `---\n\n`;

    // Opening — direct, no fluff
    md += `${this.generateOpening(topic, responses, mainAnswer)}\n\n`;

    // Source context — where this question comes from
    const subredditList = [...new Set(responses.map(r => r.subreddit).filter(Boolean))];
    if (subredditList.length > 0) {
      md += `This question came up across ${subredditList.length > 1 ? 'multiple subreddits' : subredditList[0]}: `;
      md += subredditList.map(s => `r/${s}`).join(', ');
      md += `. It's not a theoretical concern — developers are shipping vibe-coded applications right now and running into these problems in production.\n\n`;
    }

    // Main sections
    for (const section of sections) {
      md += `## ${section.heading}\n\n`;
      md += `${section.body}\n\n`;
      if (section.example) {
        md += `${section.example}\n\n`;
      }
    }

    // The research / data section
    md += `## What the Research Shows\n\n`;
    md += this.generateResearchSection(topic);
    md += `\n`;

    // The pattern section — recurring themes
    md += `## The Patterns That Keep Coming Back\n\n`;
    for (let i = 0; i < Math.min(themes.length, 5); i++) {
      md += `### ${themes[i].name}\n\n`;
      md += `${themes[i].description}\n\n`;
      if (themes[i].fix) {
        md += `**The fix:** ${themes[i].fix}\n\n`;
      }
    }

    // Closing — actionable
    md += `## What to Do About It\n\n`;
    md += `${this.generateClosing(topic)}\n\n`;

    // CTA to kolega.dev
    md += `---\n\n`;
    md += `Kolega.dev's deep code scan catches the vulnerabilities that vibe coding introduces — the ones that traditional SAST tools miss. [Scan your repo for free](https://kolega.dev).\n`;

    return md;
  }

  generateOpening(topic, responses, mainAnswer) {
    // Check if the main answer has OCR content we can reference
    const answer = mainAnswer.curated_answer;
    if (answer && answer.length > 500) {
      // Extract the first meaningful paragraph
      const lines = answer.split('\n').filter(l => l.trim().length > 50 && !l.startsWith('#') && !l.startsWith('*'));
      if (lines.length > 0) {
        return lines[0].trim();
      }
    }

    // Generic opening based on the topic
    const postCount = responses.length;
    const subredditCount = [...new Set(responses.map(r => r.subreddit).filter(Boolean))].length;
    return `A question that keeps showing up on Reddit: "${topic}" ${postCount} posts across ${subredditCount} communities, and the answers reveal a pattern that should worry anyone shipping AI-generated code.`;
  }

  generateTitle(topic, responses) {
    // Create a compelling, kolega.dev-style title
    // Match the pattern from existing blogs: direct, data-driven, provocative
    const titles = [
      'The Security Problems Nobody Talks About When They Vibe Code',
      'Reddit Found the Same Vulnerabilities We Did. Here\'s What They Are.',
      'Your AI-Written Code Has These Security Holes. Reddit Proved It.',
      'Vibe Coding Security: What Developers on Reddit Are Actually Worried About',
      'The Vulnerabilities That Ship With Every AI-Generated Codebase'
    ];
    // Pick based on the topic keywords
    if (topic.toLowerCase().includes('vibe coding') || topic.toLowerCase().includes('vibe')) {
      return titles[0];
    }
    return titles[4];
  }

  generateSubtitle(topic) {
    // Short, punchy subtitle matching kolega.dev style
    const subtitles = [
      'Security vulnerabilities in AI-generated code — drawn from real developer discussions',
      'What happens when you ship vibe-coded code without security review',
      'The vulnerabilities that AI coding assistants introduce — and why scanners miss them'
    ];
    if (topic.toLowerCase().includes('security')) {
      return subtitles[0];
    }
    return subtitles[2];
  }

  extractThemes(responses) {
    const themeKeywords = {
      'Supply Chain Risks': {
        keywords: ['supply chain', 'dependency', 'package', 'library', 'sbom', 'third-party'],
        description: 'AI tools pull patterns from massive training datasets, including open-source repos with known vulnerabilities. When developers ship this code without understanding what dependencies it references, they inherit every flaw those libraries carry.',
        fix: 'Generate a full SBOM for every AI-generated codebase. Run SCA tools against all dependencies — including the ones the AI implicitly introduced. Use Kolega.dev\'s dependency scanner to map every library before it reaches production.'
      },
      'Injection Vulnerabilities': {
        keywords: ['injection', 'sql', 'xss', 'command injection', 'sanitiz'],
        description: 'AI-generated code frequently fails to sanitize user input. SQL injection, cross-site scripting, and command injection are the most common results. The code looks syntactically correct — it just isn\'t security-aware.',
        fix: 'Run parameterized query checks on every database call. Use CSP headers and output encoding for XSS. Kolega.dev\'s SAST tier catches these patterns across your entire codebase.'
      },
      'Hardcoded Secrets': {
        keywords: ['hardcoded', 'secret', 'credential', 'api key', 'token', 'password'],
        description: 'LLMs have favourite default values. "supersecretkey" appears in thousands of AI-generated apps. They also mix up Supabase anon keys (safe with RLS) and service_role keys (skip all security). This is the fastest way to get breached.',
        fix: 'Never trust AI output with secrets. Run secret scanning on every commit. Kolega.dev detects leaked API keys, tokens, and credentials anywhere in your repo — including ones that look like they came from an LLM\'s training data.'
      },
      'Authentication Theatre': {
        keywords: ['auth', 'authentication', 'login', 'session', 'jwt', 'password', 'role'],
        description: 'AI tools build professional-looking login forms. But the API endpoints behind them are often wide open — no server-side auth, no row-level security, no session validation. It\'s security theatre: looks right, works wrong.',
        fix: 'Validate every auth endpoint independently of the frontend. Check for Row Level Security on every database table. Kolega.dev\'s semantic analysis understands auth flows and catches the gaps that SAST pattern matching misses.'
      },
      'No Security Review': {
        keywords: ['review', 'audit', 'testing', 'scan', 'vulnerability', 'security testing'],
        description: 'The vibe coding workflow itself discourages security review. When developers treat AI output as "good enough" and skip code review, security testing, and vulnerability scanning, they operate without any safety net. The speed of vibe coding outpaces the speed of security validation.',
        fix: 'Build security into the pipeline, not after it. Automated scanning on every commit, with noise reduction so you only review what matters. Kolega.dev\'s noise reduction eliminates 90% of false positives.'
      },
      'Misconfigured CORS and Headers': {
        keywords: ['cors', 'header', 'csp', 'x-frame', 'security header', 'misconfiguration'],
        description: 'AI-generated web apps frequently miss critical security headers — Content-Security-Policy, X-Frame-Options, Strict-Transport-Security — or misconfigure CORS to allow all origins. This creates opportunities for clickjacking, data theft, and cross-origin attacks.',
        fix: 'Audit security headers on every response. Lock CORS to specific origins. Kolega.dev\'s scanner detects misconfigured headers and generates the right policies automatically.'
      },
      'Race Conditions and Logic Flaws': {
        keywords: ['race condition', 'logic', 'business logic', 'authorization', 'idor', 'concurrent'],
        description: 'These are the vulnerabilities that scanners can\'t find because they require understanding what the code is supposed to do. Authorization bypass, IDOR, race conditions in payment flows — vibe-coded apps are full of them because the AI doesn\'t understand your business logic.',
        fix: 'Use tools that understand code semantics, not just patterns. Kolega.dev\'s Deep Code Scan analyzes code intent and catches the logic flaws that SAST tools miss — with 0% overlap with standard scanners.'
      }
    };

    const found = [];
    const allText = responses.map(r => `${r.question} ${r.curated_answer || ''}`).join(' ').toLowerCase();

    for (const [name, data] of Object.entries(themeKeywords)) {
      const matchCount = data.keywords.filter(kw => allText.includes(kw)).length;
      if (matchCount > 0) {
        found.push({ name, ...data, matchCount });
      }
    }

    return found.sort((a, b) => b.matchCount - a.matchCount);
  }

  generateResearchSection(topic) {
    // Use real research stats from the vibe coding blog post
    return `The numbers are consistent across every study:\n\n` +
      `- **Veracode**: 45% of AI-generated code samples failed security tests. XSS defences didn't work 86% of the time.\n` +
      `- **Escape.tech**: Scanned 5,600+ vibe-coded apps. Found 2,000+ vulnerabilities, 400+ exposed secrets, 175 cases of PII leakage.\n` +
      `- **Invicti Security Labs**: Generated 20,000 web apps with popular LLMs. 1,182 used "supersecretkey" as the JWT secret.\n` +
      `- **Stanford (Perry et al., 2022)**: People with AI assistance wrote more security flaws than those without — and were more confident their code was secure.\n` +
      `- **CodeRabbit**: AI-written code is 2.74x more likely to contain XSS vulnerabilities.\n\n` +
      `Bigger models aren't safer. More tokens don't fix bad patterns. The security performance doesn't improve with model size.`;
  }

  generateClosing(topic) {
    return `Vibe coding isn't going away. The productivity gains are real, and the market has spoken. But shipping AI-generated code without security validation is like driving blindfolded because the roads are usually clear.\n\n` +
      `The fix isn't to stop using AI. It's to add the safety net that the workflow strips away: dependency scanning, secret detection, semantic code analysis, and security review. Automated, noise-free, and fast enough to keep up with the speed of vibe coding.\n\n` +
      `Kolega.dev was built for exactly this. Deep code scanning that catches what SAST misses, with automated fix generation that understands your codebase. Scan your repo for free and see what's hiding in your AI-generated code.`;
  }

  parseMarkdownSections(markdown) {
    const sections = [];
    const lines = markdown.split('\n');
    let current = null;
    const skipPatterns = [
      /^# /, /^---$/, /^Source:/, /^Extracted:/, /^Query:/,
      /^## Source Posts/, /^## Relevant Subreddits/, /^## People Also/,
      /^\d+\.\s+\*\*/, /^- r\//, /^\(Based on/, /^- How to audit/,
      /^- What tools/, /^- Is vibe/, /^- How to add/, /^- What are the most/,
      /^- Should vibe/, /^- How to secure APIs/, /^- What security/
    ];

    for (const line of lines) {
      const shouldSkip = skipPatterns.some(p => p.test(line));
      
      if (line.startsWith('## ')) {
        const heading = line.replace(/^##+\s*/, '').trim();
        // Skip metadata-like headings
        if (heading.startsWith('Source') || heading.startsWith('Relevant') || heading.startsWith('People Also')) {
          continue;
        }
        if (current) sections.push(current);
        current = { heading, body: '', example: '' };
      } else if (shouldSkip) {
        continue;
      } else if (current) {
        if (line.trim().length > 0) {
          current.body += line + '\n';
        }
      }
    }
    if (current) sections.push(current);
    return sections.filter(s => s.body.trim().length > 0);
  }

  buildSectionsFromResponses(responses, themes) {
    // Fallback: build sections from theme extraction
    return themes.slice(0, 5).map(t => ({
      heading: t.name,
      body: t.description,
      example: t.fix ? `*${t.fix}*` : ''
    }));
  }

  generateTags(topic, themes) {
    const tags = ['AI security', 'vibe coding', 'application security'];
    for (const t of themes.slice(0, 3)) {
      tags.push(t.name.toLowerCase());
    }
    return [...new Set(tags)];
  }

  slugify(text) {
    // For query-based slugs, create a topic-focused slug
    return text
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .substring(0, 80)
      .replace(/-$/, '');
  }

  generateSlug(topic, title) {
    // Derive slug from the clean title, not the raw query
    return title
      .toLowerCase()
      .replace(/['']/g, '')
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .substring(0, 80)
      .replace(/-$/, '');
  }

  capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  estimateReadTime(responses) {
    const totalChars = responses.reduce((sum, r) => sum + (r.curated_answer?.length || r.question?.length || 0), 0);
    // Average reading speed: ~250 words/min, ~5 chars/word
    const words = totalChars / 5;
    return Math.max(5, Math.round(words / 250));
  }

  saveBlog(blog) {
    const filePath = path.join(BLOG_DIR, `${blog.slug}.md`);
    
    // Check for duplicates
    if (fs.existsSync(filePath)) {
      console.log(`Blog already exists: ${filePath}`);
      return false;
    }

    fs.writeFileSync(filePath, blog.content);
    console.log(`Blog saved: ${filePath}`);

    // Save to DB
    try {
      this.db.prepare(`
        INSERT INTO blogs (response_ids, title, slug, content, status)
        VALUES (?, ?, ?, ?, ?)
      `).run(JSON.stringify(blog.responseIds), blog.title, blog.slug, blog.content, 'draft');
    } catch (e) {
      console.log('DB save warning:', e.message);
    }

    // Git commit + push
    try {
      const { execSync } = require('child_process');
      const repoDir = path.join(__dirname, '..');
      execSync(`git -C "${repoDir}" add data/blogs/${blog.slug}.md`, { stdio: 'pipe' });
      execSync(`git -C "${repoDir}" commit -m "Add blog: ${blog.title}"`, { stdio: 'pipe' });
      execSync(`git -C "${repoDir}" push`, { stdio: 'pipe', timeout: 30000 });
      console.log(`Blog pushed to GitHub`);
    } catch (e) {
      console.log('Git push warning:', e.message);
    }

    return true;
  }
}

module.exports = { BlogGenerator };
