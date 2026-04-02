# Reddit-Monitor

Automated Reddit Q&A monitoring system for AI code security topics.

## Architecture

```
┌─────────────┐    cloudflare tunnel ┌──────────────────┐
│  Your local  │ ◄──────────────────► │  Reddit-Monitor  │
│  Chrome/PC   │   (residential IP)  │  (VPS/OpenClaw)  │
│  + CDP :9222 │                     │                  │
└─────────────┘                     │  1. Query Reddit  │
                                    │  2. Extract Q&As  │
                                    │  3. Store results │
                                    │  4. Generate blog │
                                    │  5. Create video  │
                                    │  6. Post adverts  │
                                    └──────────────────┘
```

## Components

1. **Reddit Scraper** — CDP browser automation to search Reddit, extract curated answers & "People also search for" questions
2. **Response Store** — SQLite DB for all collected Q&As and follow-up questions
3. **Blog Generator** — Converts Q&As into SEO blog posts for kolega.dev
4. **Video Generator** — Converts blog posts into headless YouTube videos
5. **Reddit Advert Poster** — Posts promotional content back to relevant subreddits

## Setup

### 1. Local Machine — Chrome CDP + cloudflare

On your local machine (residential IP, not blocked by Reddit):

```bash
# Launch Chrome with CDP
google-chrome --remote-debugging-port=9222 --user-data-dir=~/.chrome-debug-profile --no-first-run &

# Tunnel CDP port through cloudflare
cloudflare tcp 9222
```

Note the cloudflare TCP address ?

### 2. VPS — Configure OpenClaw

```bash
openclaw config set browser.cdpUrl "http://0.tcp.cloudflare.com:12345"
```

Log into Reddit in the CDP Chrome instance (one-time).

### 3. Install dependencies

```bash
cd Reddit-Monitor
npm install
```

### 4. Configure queries

Edit `config/queries.json` with your search topics.

### 5. Run manually or via cron

Manual:
```bash
node src/run.js
```

Cron (daily at 10:00 UTC):
```bash
node src/run.js --mode query
node src/run.js --mode blog
node src/run.js --mode video
node src/run.js --mode post
```

## Pipeline Modes

| Mode | Description |
|------|-------------|
| `query` | Search Reddit, extract answers & follow-up questions |
| `blog` | Generate blog posts from collected Q&As |
| `video` | Convert blogs to headless YouTube videos |
| `post` | Create and post Reddit adverts |
| `all` | Run full pipeline (query → blog → video → post) |

## Data

- `data/responses/` — Raw scraped Q&A responses (JSON)
- `data/blogs/` — Generated blog posts (Markdown)
- `data/videos/` — Generated video metadata
- `data/posts/` — Reddit post history
- `data/reddit-monitor.db` — SQLite database

## Status

- [x] Project scaffold
- [x] GitHub repo
- [ ] Reddit scraper (CDP browser)
- [ ] Response storage (SQLite)
- [ ] Blog generator
- [ ] Video generator
- [ ] Reddit advert poster
- [ ] Cron job integration
- [ ] cloudflare tunnel setup guide
