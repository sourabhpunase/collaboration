const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const MultiTenantService = require('./multi-tenant');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const multiTenant = new MultiTenantService();
const activeSessions = new Map(); // roomId -> Set of socket connections

app.use(cors());
app.use(express.json());

// Middleware to authenticate API keys
const authenticateApiKey = (req, res, next) => {
  const apiKey = req.headers.authorization?.replace('Bearer ', '');
  if (!apiKey) {
    return res.status(401).json({ error: 'API key required' });
  }
  
  const customer = multiTenant.getCustomerByApiKey(apiKey);
  if (!customer) {
    return res.status(401).json({ error: 'Invalid API key' });
  }
  
  req.customer = customer;
  next();
};

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Customer Management API
app.post('/customers', async (req, res) => {
  try {
    const customer = multiTenant.createCustomer(req.body);
    res.status(201).json({ success: true, customer });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Room Management API
app.post('/rooms', authenticateApiKey, (req, res) => {
  try {
    if (!multiTenant.checkLimits(req.customer.id, 'rooms')) {
      return res.status(403).json({ 
        success: false, 
        error: 'Room limit exceeded for your plan' 
      });
    }
    
    const room = multiTenant.createRoom(req.customer.id, req.body);
    multiTenant.triggerWebhook(req.customer.id, 'room.created', room);
    
    res.status(201).json({ success: true, room });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

app.get('/rooms', authenticateApiKey, (req, res) => {
  try {
    const rooms = multiTenant.getRoomsByCustomer(req.customer.id);
    res.json({ success: true, rooms });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/rooms/:roomId/join', authenticateApiKey, (req, res) => {
  try {
    const { roomId } = req.params;
    const { userId, userData } = req.body;
    
    const room = multiTenant.joinRoom(roomId, userId, userData);
    multiTenant.triggerWebhook(req.customer.id, 'room.joined', { roomId, userId });
    
    res.json({ success: true, room });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

app.post('/rooms/:roomId/leave', authenticateApiKey, (req, res) => {
  try {
    const { roomId } = req.params;
    const { userId } = req.body;
    
    multiTenant.leaveRoom(roomId, userId);
    multiTenant.triggerWebhook(req.customer.id, 'room.left', { roomId, userId });
    
    res.json({ success: true });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Invitation API
app.post('/rooms/:roomId/invite', authenticateApiKey, (req, res) => {
  try {
    const { roomId } = req.params;
    const { emails } = req.body;
    
    const invitations = multiTenant.inviteToRoom(roomId, emails, {
      name: req.customer.name,
      email: req.customer.email
    });
    
    res.json({ success: true, invitations });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Analytics API
app.get('/analytics', authenticateApiKey, (req, res) => {
  try {
    const { timeRange = '7d' } = req.query;
    const analytics = multiTenant.getAnalytics(req.customer.id, timeRange);
    res.json({ success: true, analytics });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Webhook API
app.post('/webhooks', authenticateApiKey, (req, res) => {
  try {
    const webhook = multiTenant.addWebhook(req.customer.id, req.body);
    res.status(201).json({ success: true, webhook });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Real-time WebSocket handling
io.use((socket, next) => {
  const apiKey = socket.handshake.auth.publishableKey;
  if (!apiKey) {
    return next(new Error('API key required'));
  }
  
  const customer = multiTenant.getCustomerByApiKey(apiKey);
  if (!customer) {
    return next(new Error('Invalid API key'));
  }
  
  socket.customer = customer;
  next();
});

io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id} for customer: ${socket.customer.name}`);
  
  socket.on('join-room', ({ roomId, userId, userData }) => {
    try {
      socket.join(roomId);
      socket.roomId = roomId;
      socket.userId = userId;
      
      // Track active session
      if (!activeSessions.has(roomId)) {
        activeSessions.set(roomId, new Set());
      }
      activeSessions.get(roomId).add(socket.id);
      
      // Update room membership
      multiTenant.joinRoom(roomId, userId, userData);
      
      // Notify other users in the room
      socket.to(roomId).emit('user-joined', {
        userId,
        userData,
        timestamp: Date.now()
      });
      
      // Send current room state
      const roomSessions = activeSessions.get(roomId);
      socket.emit('room-state', {
        activeUsers: roomSessions.size,
        roomId
      });
      
    } catch (error) {
      socket.emit('error', { message: error.message });
    }
  });
  
  socket.on('cursor-move', (data) => {
    if (socket.roomId) {
      socket.to(socket.roomId).emit('cursor-update', {
        userId: socket.userId,
        ...data,
        timestamp: Date.now()
      });
    }
  });
  
  socket.on('content-change', (data) => {
    if (socket.roomId) {
      socket.to(socket.roomId).emit('content-update', {
        userId: socket.userId,
        ...data,
        timestamp: Date.now()
      });
      
      // Track analytics
      multiTenant.trackAnalytics(socket.customer.id, 'content_change', {
        roomId: socket.roomId,
        userId: socket.userId
      });
    }
  });
  
  socket.on('message', (data) => {
    if (socket.roomId) {
      socket.to(socket.roomId).emit('message', {
        userId: socket.userId,
        ...data,
        timestamp: Date.now()
      });
    }
  });
  
  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);
    
    if (socket.roomId) {
      // Remove from active sessions
      const roomSessions = activeSessions.get(socket.roomId);
      if (roomSessions) {
        roomSessions.delete(socket.id);
        if (roomSessions.size === 0) {
          activeSessions.delete(socket.roomId);
        }
      }
      
      // Update room membership
      if (socket.userId) {
        multiTenant.leaveRoom(socket.roomId, socket.userId);
      }
      
      // Notify other users
      socket.to(socket.roomId).emit('user-left', {
        userId: socket.userId,
        timestamp: Date.now()
      });
    }
  });
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`🚀 CollabFlow SaaS API running on port ${PORT}`);
  console.log(`📊 Dashboard API: http://localhost:${PORT}`);
  console.log(`🔌 WebSocket: ws://localhost:${PORT}`);
  console.log(`🔑 Demo API Key: pk_live_demo123456789`);
  console.log(`✅ Multi-tenant system ready!`);
});

module.exports = app;