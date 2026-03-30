/**
 * OpenClaw Agent Task Runner
 * 
 * This script is called by the OpenClaw cron job or manually.
 * It prints a task description that the agent will execute.
 * 
 * Usage:
 *   node src/run.js --mode query     # Run Reddit queries
 *   node src/run.js --mode blog      # Generate blog posts
 *   node src/run.js --mode video     # Generate YouTube videos
 *   node src/run.js --mode post      # Post Reddit adverts
 *   node src/run.js --mode all       # Full pipeline
 */

const path = require('path');
const { getDb, init, stats } = require('./db');
const { RedditScraper, AGENT_INSTRUCTIONS } = require('./scraper');
const config = require(path.join(__dirname, '..', 'config', 'queries.json'));

const mode = process.argv.find((a, i) => process.argv[i - 1] === '--mode') || 'query';

// Ensure DB is ready
init();

const scraper = new RedditScraper();

switch (mode) {
  case 'init':
    stats();
    process.exit(0);

  case 'stats':
    stats();
    process.exit(0);

  case 'query': {
    // Get queries: configured + unused follow-ups
    const followups = scraper.getUnusedFollowups(3);
    const queries = [
      ...config.queries,
      ...followups.map(f => f.question_text)
    ];

    console.log('=== Reddit Query Run ===');
    console.log(`Queries to run: ${queries.length}`);
    console.log(`  Configured: ${config.queries.length}`);
    console.log(`  Follow-ups: ${followups.length}`);
    console.log();
    console.log('Execute the following queries using CDP browser (profile="openclaw"):');
    console.log();

    for (const q of queries) {
      const queryId = scraper.createQuery(q);
      console.log(`[${queryId}] ${q}`);
    }

    console.log();
    console.log(AGENT_INSTRUCTIONS);
    break;
  }

  case 'blog': {
    const responses = scraper.getUnbloggedResponses();
    console.log('=== Blog Generation ===');
    console.log(`Unblogged responses: ${responses.length}`);
    if (responses.length === 0) {
      console.log('Nothing to generate. Run queries first.');
      process.exit(0);
    }
    console.log('\nFor each response, generate a blog post covering:');
    console.log('- The question and context');
    console.log('- A detailed, SEO-optimized answer');
    console.log('- Related topics from other responses');
    console.log('- Target: kolega.dev audience (developers interested in AI code security)');
    console.log('\nSave via scraper.saveBlog() with responseIds linking the source Q&As.');
    break;
  }

  case 'video': {
    const blogs = scraper.getUnvideoedBlogs();
    console.log('=== Video Generation ===');
    console.log(`Blogs without videos: ${blogs.length}`);
    if (blogs.length === 0) {
      console.log('Nothing to generate. Create blogs first.');
      process.exit(0);
    }
    console.log('\nFor each blog, create a headless YouTube video:');
    console.log('- Script the blog content as narration');
    console.log('- Use TTS for voiceover');
    console.log('- Generate simple visual frames (code snippets, diagrams)');
    console.log('- Upload via YouTube API');
    break;
  }

  case 'post': {
    console.log('=== Reddit Advert Posting ===');
    console.log('For each published blog/video, create a Reddit post:');
    console.log('- Target: subreddit where the original question was asked');
    console.log('- Plus adjacent communities from config.subreddits');
    console.log('- Post as link or text with value-add summary');
    console.log('- Include link to full blog on kolega.dev');
    console.log('\nMax 2 posts per day to avoid spam filters.');
    break;
  }

  case 'all':
    console.log('Full pipeline: query → blog → video → post');
    console.log('Run each mode sequentially.');
    break;

  default:
    console.error(`Unknown mode: ${mode}`);
    console.error('Valid modes: query, blog, video, post, all, init, stats');
    process.exit(1);
}
