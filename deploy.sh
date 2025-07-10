#!/bin/bash

# Deploy CollabFlow Backend - Choose One Option

echo "🚀 CollabFlow Backend Deployment"
echo "Choose deployment option:"
echo "1. Railway (Recommended - Free)"
echo "2. Vercel (Free)"
echo "3. Render (Free)"

read -p "Enter choice (1-3): " choice

case $choice in
  1)
    echo "📡 Deploying to Railway..."
    
    # Install Railway CLI
    npm install -g @railway/cli
    
    # Login and deploy
    railway login
    railway new collabflow-api
    cd api
    railway add
    railway deploy
    
    echo "✅ Deployed to Railway!"
    echo "🔗 Your API: https://collabflow-api.railway.app"
    ;;
    
  2)
    echo "📡 Deploying to Vercel..."
    
    # Install Vercel CLI
    npm install -g vercel
    
    # Deploy
    cd api
    vercel --prod
    
    echo "✅ Deployed to Vercel!"
    ;;
    
  3)
    echo "📡 Deploying to Render..."
    echo "1. Go to https://render.com"
    echo "2. Connect your GitHub repo"
    echo "3. Select 'api' folder as root"
    echo "4. Set build command: npm install"
    echo "5. Set start command: node server.js"
    echo "6. Click Deploy"
    ;;
    
  *)
    echo "❌ Invalid choice"
    ;;
esac