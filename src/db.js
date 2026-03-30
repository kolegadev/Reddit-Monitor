const Database = require('better-sqlite3');
const path = require('path');

const DB_PATH = path.join(__dirname, '..', 'data', 'reddit-monitor.db');

let db;

function getDb() {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
  }
  return db;
}

function init() {
  const db = getDb();
  db.exec(`
    CREATE TABLE IF NOT EXISTS queries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      query_text TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      executed_at TEXT NOT NULL DEFAULT (datetime('now')),
      completed_at TEXT,
      error TEXT
    );

    CREATE TABLE IF NOT EXISTS responses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      query_id INTEGER NOT NULL,
      source_url TEXT,
      subreddit TEXT,
      question TEXT,
      curated_answer TEXT,
      answer_author TEXT,
      upvotes INTEGER DEFAULT 0,
      collected_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (query_id) REFERENCES queries(id)
    );

    CREATE TABLE IF NOT EXISTS followup_questions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      query_id INTEGER NOT NULL,
      question_text TEXT NOT NULL,
      source TEXT DEFAULT 'people_also_search',
      used INTEGER DEFAULT 0,
      collected_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (query_id) REFERENCES queries(id)
    );

    CREATE TABLE IF NOT EXISTS blogs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      response_ids TEXT NOT NULL,
      title TEXT NOT NULL,
      slug TEXT UNIQUE,
      content TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'draft',
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      published_at TEXT,
      publish_url TEXT
    );

    CREATE TABLE IF NOT EXISTS videos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      blog_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      script TEXT,
      status TEXT NOT NULL DEFAULT 'draft',
      video_url TEXT,
      youtube_id TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (blog_id) REFERENCES blogs(id)
    );

    CREATE TABLE IF NOT EXISTS reddit_posts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      video_id INTEGER,
      blog_id INTEGER,
      subreddit TEXT NOT NULL,
      title TEXT NOT NULL,
      body TEXT NOT NULL,
      post_url TEXT,
      status TEXT NOT NULL DEFAULT 'draft',
      posted_at TEXT,
      FOREIGN KEY (video_id) REFERENCES videos(id),
      FOREIGN KEY (blog_id) REFERENCES blogs(id)
    );
  `);
  console.log('Database initialized:', DB_PATH);
}

function stats() {
  const db = getDb();
  const queries = db.prepare("SELECT COUNT(*) as total, COALESCE(SUM(CASE WHEN status='completed' THEN 1 ELSE 0 END),0) as completed FROM queries").get();
  const responses = db.prepare('SELECT COUNT(*) as total FROM responses').get();
  const followups = db.prepare('SELECT COUNT(*) as total, COALESCE(SUM(CASE WHEN used=0 THEN 1 ELSE 0 END),0) as unused FROM followup_questions').get();
  const blogs = db.prepare("SELECT COUNT(*) as total, COALESCE(SUM(CASE WHEN status='published' THEN 1 ELSE 0 END),0) as published FROM blogs").get();
  const videos = db.prepare('SELECT COUNT(*) as total FROM videos').get();
  const posts = db.prepare("SELECT COUNT(*) as total, COALESCE(SUM(CASE WHEN status='posted' THEN 1 ELSE 0 END),0) as posted FROM reddit_posts").get();

  console.log('=== Reddit-Monitor DB Stats ===');
  console.log(`Queries: ${queries.completed}/${queries.total} completed`);
  console.log(`Responses: ${responses.total}`);
  console.log(`Follow-up questions: ${followups.total} (${followups.unused} unused)`);
  console.log(`Blogs: ${blogs.published}/${blogs.total} published`);
  console.log(`Videos: ${videos.total}`);
  console.log(`Reddit posts: ${posts.posted}/${posts.total} posted`);
}

module.exports = { getDb, init, stats };
