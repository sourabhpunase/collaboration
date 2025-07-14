#!/bin/bash

echo "🚀 Starting CollabFlow Production System"
echo "========================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to check if port is available
check_port() {
    if lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null ; then
        echo -e "${RED}Port $1 is already in use${NC}"
        return 1
    else
        echo -e "${GREEN}Port $1 is available${NC}"
        return 0
    fi
}

# Kill existing processes
echo -e "${YELLOW}Cleaning up existing processes...${NC}"
pkill -f "node.*saas-server" 2>/dev/null || true
pkill -f "next.*dev" 2>/dev/null || true

# Wait a moment
sleep 2

echo ""
echo -e "${BLUE}Starting CollabFlow Services...${NC}"
echo ""

# Start API Server
echo -e "${YELLOW}1. Starting SaaS API Server (Port 4000)...${NC}"
cd api
if check_port 4000; then
    node saas-server.js &
    API_PID=$!
    echo -e "${GREEN}✅ API Server started (PID: $API_PID)${NC}"
    echo -e "${GREEN}   URL: http://localhost:4000${NC}"
    echo -e "${GREEN}   Demo API Key: pk_live_demo123456789${NC}"
else
    echo -e "${RED}❌ Cannot start API server - port 4000 in use${NC}"
    exit 1
fi

# Wait for API to start
sleep 3

# Start Dashboard
echo ""
echo -e "${YELLOW}2. Starting Admin Dashboard (Port 3000)...${NC}"
cd ../dashboard
if check_port 3000; then
    if [ ! -d "node_modules" ]; then
        echo -e "${YELLOW}Installing dashboard dependencies...${NC}"
        npm install
    fi
    npm run dev &
    DASHBOARD_PID=$!
    echo -e "${GREEN}✅ Dashboard started (PID: $DASHBOARD_PID)${NC}"
    echo -e "${GREEN}   URL: http://localhost:3000${NC}"
else
    echo -e "${RED}❌ Cannot start dashboard - port 3000 in use${NC}"
fi

# Start Landing Page
echo ""
echo -e "${YELLOW}3. Starting Landing Page (Port 3002)...${NC}"
cd ../landing
if check_port 3002; then
    if [ ! -d "node_modules" ]; then
        echo -e "${YELLOW}Installing landing page dependencies...${NC}"
        npm install
    fi
    npm run dev &
    LANDING_PID=$!
    echo -e "${GREEN}✅ Landing Page started (PID: $LANDING_PID)${NC}"
    echo -e "${GREEN}   URL: http://localhost:3002${NC}"
else
    echo -e "${RED}❌ Cannot start landing page - port 3002 in use${NC}"
fi

# Start Demo App
echo ""
echo -e "${YELLOW}4. Starting Demo App (Port 5173)...${NC}"
cd ../realtime
if check_port 5173; then
    if [ ! -d "node_modules" ]; then
        echo -e "${YELLOW}Installing demo app dependencies...${NC}"
        npm install
    fi
    npm run dev &
    DEMO_PID=$!
    echo -e "${GREEN}✅ Demo App started (PID: $DEMO_PID)${NC}"
    echo -e "${GREEN}   URL: http://localhost:5173${NC}"
else
    echo -e "${RED}❌ Cannot start demo app - port 5173 in use${NC}"
fi

echo ""
echo -e "${GREEN}🎉 CollabFlow Production System Started!${NC}"
echo "========================================"
echo ""
echo -e "${BLUE}📊 Admin Dashboard:${NC}  http://localhost:3000"
echo -e "${BLUE}🌐 Landing Page:${NC}     http://localhost:3002"
echo -e "${BLUE}🔧 API Server:${NC}       http://localhost:4000"
echo -e "${BLUE}🧪 Demo App:${NC}         http://localhost:5173"
echo ""
echo -e "${YELLOW}🔑 Demo API Key:${NC} pk_live_demo123456789"
echo ""
echo -e "${GREEN}✨ Your SaaS is ready for developers to use!${NC}"
echo ""
echo -e "${YELLOW}To stop all services, run:${NC} pkill -f 'node.*saas-server|next.*dev'"
echo ""

# Keep script running
wait