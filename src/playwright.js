/**
 * Playwright-based Reddit scraper
 * Connects to a remote Chrome CDP instance (tunneled via Cloudflare)
 * and extracts Reddit Answers content via browser automation.
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const CDP_URL = process.env.CDP_URL || 'http://localhost:9255';
const DATA_DIR = path.join(__dirname, '..', 'data');

class RedditPlaywright {
  constructor(cdpUrl = CDP_URL) {
    this.cdpUrl = cdpUrl;
    this.browser = null;
  }

  async connect() {
    this.browser = await chromium.connectOverCDP(this.cdpUrl);
    return this;
  }

  getPage() {
    const ctx = this.browser.contexts()[0];
    return ctx.pages()[0] || ctx.newPage();
  }

  disconnect() {
    if (this.browser) this.browser.close().catch(() => {});
  }

  /**
   * Run a search query via Reddit Answers (the "Ask" button)
   * Navigates to the search, clicks Ask, waits for the AI answer
   */
  async searchAnswers(query) {
    const page = this.getPage();
    const searchUrl = `https://www.reddit.com/search/?q=${encodeURIComponent(query)}&sort=relevance&t=year`;
    
    console.log(`Navigating to search: ${query}`);
    await page.goto(searchUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(3000);

    // Click the "Ask" button if present
    try {
      const askBtn = await page.$('button[data-testid="search-ask-button"], [id*="ask"], shreddit-button-quisyn');
      if (askBtn) {
        await askBtn.click();
        await page.waitForTimeout(8000); // Wait for answer to stream
        console.log('Clicked Ask button, waiting for answer...');
      }
    } catch (e) {
      console.log('No Ask button found, trying URL approach...');
    }

    // Check if we landed on an answers page
    const currentUrl = page.url();
    if (currentUrl.includes('/answers/')) {
      console.log('On answers page:', currentUrl);
      return this.extractAnswerPage(page, query);
    }

    return { query, url: currentUrl, error: 'Did not reach answers page' };
  }

  /**
   * Extract data from a Reddit Answers page
   */
  async extractAnswerPage(page, query) {
    // Wait for streaming to complete
    await page.waitForTimeout(5000);

    const url = page.url();
    const title = await page.title();

    // Take screenshot for visual verification / OCR fallback
    const screenshotPath = path.join(DATA_DIR, `answer-${Date.now()}.png`);
    await page.screenshot({ path: screenshotPath, fullPage: true });
    console.log('Screenshot saved:', screenshotPath);

    // Capture API responses by intercepting network
    const sourcePosts = [];
    const subreddits = [];

    // Extract from the page's source posts (API response)
    try {
      const apiData = await page.evaluate(() => {
        // Try to find the guides-recommended-posts content
        const postLinks = Array.from(document.querySelectorAll('a[href*="/comments/"]'));
        return postLinks.slice(0, 20).map(a => ({
          href: a.getAttribute('href'),
          text: a.textContent?.trim()?.substring(0, 200)
        })).filter(p => p.href && p.text);
      });
      sourcePosts.push(...apiData);
    } catch (e) {}

    // Extract subreddit info from sidebar cards
    try {
      const subData = await page.evaluate(() => {
        // Deep shadow DOM extraction for subreddit cards
        const results = [];
        const allEls = document.querySelectorAll('*');
        for (const el of allEls) {
          if (el.shadowRoot) {
            const texts = el.shadowRoot.querySelectorAll('*');
            for (const t of texts) {
              const txt = t.textContent?.trim();
              if (txt && txt.includes('weekly') && txt.includes('users')) {
                results.push(txt.substring(0, 300));
              }
            }
          }
        }
        return results;
      });
      subreddits.push(...subData);
    } catch (e) {}

    // Scroll down to look for follow-up questions
    await page.evaluate(() => window.scrollBy(0, 1500));
    await page.waitForTimeout(2000);
    
    const screenshotPath2 = path.join(DATA_DIR, `answer-scrolled-${Date.now()}.png`);
    await page.screenshot({ path: screenshotPath2, fullPage: false });

    // Extract follow-up question links
    let followUpQuestions = [];
    try {
      followUpQuestions = await page.evaluate(() => {
        // Look for "People also ask" or "Related searches" patterns
        const allLinks = Array.from(document.querySelectorAll('a'));
        return allLinks
          .map(a => ({ href: a.getAttribute('href'), text: a.textContent?.trim() }))
          .filter(l => l.href && l.text && l.text.length > 20 && l.href.includes('search'))
          .map(l => l.text)
          .filter((t, i, arr) => arr.indexOf(t) === i);
      });
    } catch (e) {}

    return {
      query,
      url,
      title,
      screenshotPath,
      sourcePosts: sourcePosts.filter(p => p.href),
      subreddits,
      followUpQuestions,
      extractedAt: new Date().toISOString(),
      note: 'Answer text is in closed shadow DOM - use screenshot for OCR if needed'
    };
  }

  /**
   * Run a regular Reddit search (not Answers) and extract post results
   */
  async searchPosts(query, opts = {}) {
    const page = this.getPage();
    const sort = opts.sort || 'relevance';
    const time = opts.time || 'year';
    const url = `https://www.reddit.com/search/?q=${encodeURIComponent(query)}&sort=${sort}&t=${time}`;

    console.log(`Searching Reddit: ${query}`);
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(3000);

    const posts = await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll('a[href*="/comments/"]'));
      const seen = new Set();
      return links
        .map(a => ({
          title: a.textContent?.trim()?.substring(0, 300),
          href: a.getAttribute('href'),
          subreddit: a.getAttribute('href')?.match(/\/r\/([^/]+)/)?.[1]
        }))
        .filter(p => p.title && p.title.length > 10 && p.href)
        .filter(p => {
          if (seen.has(p.href)) return false;
          seen.add(p.href);
          return true;
        });
    });

    return { query, url: page.url(), posts, count: posts.length };
  }

  /**
   * Navigate to a specific Reddit post and extract the top answers
   */
  async getPostAnswers(postUrl) {
    const page = this.getPage();
    console.log(`Fetching post: ${postUrl}`);
    
    await page.goto(postUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(3000);

    const title = await page.title();
    
    // Extract top comments
    const comments = await page.evaluate(() => {
      const commentEls = Array.from(document.querySelectorAll('shreddit-comment, [data-testid="comment"]'));
      return commentEls.slice(0, 10).map(c => ({
        author: c.getAttribute('author') || c.querySelector('a[href*="/user/"]')?.textContent?.trim(),
        score: c.getAttribute('score'),
        text: c.textContent?.trim()?.substring(0, 1000)
      })).filter(c => c.text && c.text.length > 20);
    });

    await page.screenshot({ path: path.join(DATA_DIR, `post-${Date.now()}.png`) });

    return { url: postUrl, title, comments, count: comments.length };
  }
}

module.exports = { RedditPlaywright, CDP_URL };
