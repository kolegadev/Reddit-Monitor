/**
 * Reddit Query Runner
 * 
 * This is the core scraper that runs via OpenClaw's CDP browser (profile="openclaw").
 * It is NOT a standalone script — it's designed to be called by an OpenClaw agent/cron
 * that has access to the browser tool.
 * 
 * The agent should:
 * 1. Navigate to reddit.com/search
 * 2. Type the query into the search bar
 * 3. Extract curated answers from results
 * 4. Scroll to find "People also search for" questions
 * 5. Save everything to the DB
 */

const path = require('path');
const { getDb } = require('./db');
const config = require('../config/queries.json');

class RedditScraper {
  constructor() {
    this.db = getDb();
  }

  /**
   * Create a query record and return its ID
   */
  createQuery(queryText) {
    const result = this.db.prepare(
      'INSERT INTO queries (query_text, status) VALUES (?, ?)'
    ).run(queryText, 'running');
    return result.lastInsertRowid;
  }

  /**
   * Save a response from Reddit
   */
  saveResponse(queryId, { sourceUrl, subreddit, question, curatedAnswer, author, upvotes }) {
    this.db.prepare(`
      INSERT INTO responses (query_id, source_url, subreddit, question, curated_answer, answer_author, upvotes)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(queryId, sourceUrl, subreddit, question, curatedAnswer, author, upvotes || 0);
  }

  /**
   * Save a follow-up question from "People also search for"
   */
  saveFollowup(queryId, questionText) {
    // Deduplicate
    const existing = this.db.prepare(
      'SELECT id FROM followup_questions WHERE question_text = ? AND used = 0'
    ).get(questionText);
    if (existing) return;

    this.db.prepare(
      'INSERT INTO followup_questions (query_id, question_text) VALUES (?, ?)'
    ).run(queryId, questionText);
  }

  /**
   * Mark a query as completed
   */
  completeQuery(queryId, error = null) {
    this.db.prepare(
      'UPDATE queries SET status = ?, completed_at = datetime("now"), error = ? WHERE id = ?'
    ).run(error ? 'failed' : 'completed', error, queryId);
  }

  /**
   * Get unused follow-up questions for future queries
   */
  getUnusedFollowups(limit = 5) {
    return this.db.prepare(
      'SELECT * FROM followup_questions WHERE used = 0 ORDER BY collected_at DESC LIMIT ?'
    ).all(limit);
  }

  /**
   * Mark follow-up questions as used
   */
  markFollowupsUsed(ids) {
    const stmt = this.db.prepare('UPDATE followup_questions SET used = 1 WHERE id = ?');
    const tx = this.db.transaction((ids) => {
      for (const id of ids) stmt.run(id);
    });
    tx(ids);
  }

  /**
   * Get pending responses (not yet turned into blogs)
   */
  getUnbloggedResponses() {
    // Find response IDs that are NOT referenced in any blog
    return this.db.prepare(`
      SELECT r.* FROM responses r
      WHERE r.id NOT IN (
        SELECT CAST(value AS INTEGER) FROM blogs, json_each(blogs.response_ids)
      )
      ORDER BY r.collected_at DESC
    `).all();
  }

  /**
   * Save a blog post
   */
  saveBlog({ responseIds, title, slug, content }) {
    try {
      this.db.prepare(`
        INSERT INTO blogs (response_ids, title, slug, content) VALUES (?, ?, ?, ?)
      `).run(JSON.stringify(responseIds), title, slug, content);
      return true;
    } catch (e) {
      if (e.message.includes('UNIQUE')) {
        console.log(`Blog slug "${slug}" already exists, skipping.`);
        return false;
      }
      throw e;
    }
  }

  /**
   * Get unpublished blogs (not yet turned into videos)
   */
  getUnvideoedBlogs() {
    return this.db.prepare(`
      SELECT b.* FROM blogs b
      WHERE b.status = 'draft' AND b.id NOT IN (SELECT blog_id FROM videos)
      ORDER BY b.created_at DESC
    `).all();
  }
}

/**
 * Agent instructions for running the Reddit scrape.
 * This is what the OpenClaw agent should follow when executing a query run.
 */
const AGENT_INSTRUCTIONS = `
## Reddit Query Run Instructions

You have access to the CDP browser via \`browser(action=..., profile="openclaw")\`.
The browser is tunneled through ngrok to a local machine with a residential IP.

### Steps:

1. **Navigate to Reddit search:**
   - \`browser(action="navigate", profile="openclaw", targetUrl="https://www.reddit.com/search/?q=QUERY&sort=relevance&t=year")\`

2. **Wait for results to load** (2-3 seconds)

3. **Take a snapshot** to parse the results:
   - \`browser(action="snapshot", profile="openclaw")\`
   - Extract: post titles, subreddits, URLs, top curated answers
   - Look for the "Curated Results" section or top-voted answers

4. **For each relevant post**, navigate to it and extract:
   - Full question
   - Top curated/best answer
   - Upvote count
   - Author

5. **Find "People also search for":**
   - Scroll down on the search results page
   - Look for a section with related search suggestions
   - Extract all suggested questions

6. **Save everything** using the RedditScraper class:
   - Save responses via \`saveResponse()\`
   - Save follow-up questions via \`saveFollowup()\`

7. **Mark query as completed** via \`completeQuery(queryId)\`

### Important:
- Reddit loads content dynamically — use \`browser(action="snapshot")\` to get current DOM
- If blocked or rate-limited, back off and retry in 60 seconds
- Save incrementally — don't wait until the end to persist
`;

module.exports = { RedditScraper, AGENT_INSTRUCTIONS };
