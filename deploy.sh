#!/bin/bash
set -e

echo "Deploying update..."

# 1. Install dependencies
echo "Installing dependencies..."
npm install

# 2. Build the project (Client + Server)
echo "Building project..."
npm run build

# 3. Restart PM2 process
echo "Restarting application..."
if pm2 list | grep -q "meixiulow"; then
    pm2 restart meixiulow
else
    pm2 start ecosystem.config.cjs
fi

echo "Deployment complete! Application should be running on port 3001 (from .env) or 5000 (default)."
