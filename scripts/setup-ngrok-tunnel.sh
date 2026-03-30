#!/bin/bash
# setup-ngrok-tunnel.sh
# Run this on your LOCAL machine to tunnel Chrome CDP to the VPS
# 
# Prerequisites:
#   1. Chrome running with CDP: google-chrome --remote-debugging-port=9222 --user-data-dir=~/.chrome-debug-profile --no-first-run
#   2. ngrok installed: brew install ngrok || snap install ngrok
#   3. ngrok auth: ngrok config add-authtoken YOUR_TOKEN

set -e

PORT=${1:-9222}

echo "=== Reddit-Monitor: ngrok CDP Tunnel Setup ==="
echo ""
echo "Step 1: Make sure Chrome is running with CDP on port $PORT"
echo "  google-chrome --remote-debugging-port=$PORT --user-data-dir=~/.chrome-debug-profile --no-first-run &"
echo ""
echo "Step 2: Verify Chrome CDP is responding"
if curl -s http://127.0.0.1:$PORT/json/version > /dev/null 2>&1; then
    echo "  ✅ Chrome CDP is running on port $PORT"
else
    echo "  ❌ Chrome CDP not found on port $PORT — start Chrome first!"
    exit 1
fi

echo ""
echo "Step 3: Starting ngrok TCP tunnel..."
echo "  ngrok tcp $PORT"
echo ""
echo "  ⚠️  ngrok will output a URL like: tcp://0.tcp.ngrok.io:12345"
echo "  Copy that URL and update config/queries.json:"
echo "    \"ngrok\": { \"remoteUrl\": \"0.tcp.ngrok.io:12345\" }"
echo ""
echo "  Then on the VPS, configure OpenClaw:"
echo "    openclaw config set browser.cdpUrl http://0.tcp.ngrok.io:12345"
echo ""
echo "Step 4: Test the connection from VPS:"
echo "  curl http://0.tcp.ngrok.io:12345/json/version"
echo ""
echo "Starting ngrok..."
ngrok tcp $PORT
