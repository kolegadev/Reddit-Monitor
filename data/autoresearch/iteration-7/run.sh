#!/bin/bash
# Run 5 iterations of autoresearch
DIR="/root/.openclaw/workspace/Reddit-Monitor/data/autoresearch/iteration-7"
BASELINE="/root/.openclaw/workspace/Reddit-Monitor/data/blogs/how-to-add-security-testing-to-vibe-coding-workflow.md"

cp "$BASELINE" "$DIR/best_blog.md"

for i in 1 2 3 4 5; do
  echo "=== ITERATION $i ==="
  python3 /root/.openclaw/workspace/autoresearch/scripts/run_iteration.py "$DIR" $i
  echo ""
done

echo "=== DONE ==="
