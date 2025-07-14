const crypto = require('crypto');

class MultiTenantService {
  constructor() {
    this.customers = new Map();
    this.apiKeys = new Map();
    this.rooms = new Map();
    this.roomMembers = new Map();
    this.analytics = new Map();
    this.webhooks = new Map();
    
    // Initialize demo customer
    this.initializeDemoCustomer();
  }

  initializeDemoCustomer() {
    const customerId = 'cust_demo_123';
    const publishableKey = 'pk_live_demo123456789';
    const secretKey = 'sk_live_demo987654321';
    
    this.customers.set(customerId, {
      id: customerId,
      name: 'Demo Customer',
      email: 'demo@collabflow.dev',
      publishableKey,
      secretKey,
      plan: 'free',
      createdAt: new Date().toISOString(),
      limits: {
        rooms: 10,
        concurrentUsers: 50,
        apiCalls: 10000
      }
    });
    
    this.apiKeys.set(publishableKey, { customerId, type: 'publishable' });
    this.apiKeys.set(secretKey, { customerId, type: 'secret' });
  }

  // Customer Management
  createCustomer(data) {
    const customerId = `cust_${crypto.randomUUID()}`;
    const publishableKey = `pk_live_${crypto.randomBytes(16).toString('hex')}`;
    const secretKey = `sk_live_${crypto.randomBytes(16).toString('hex')}`;
    
    const customer = {
      id: customerId,
      name: data.name,
      email: data.email,
      publishableKey,
      secretKey,
      plan: data.plan || 'free',
      createdAt: new Date().toISOString(),
      limits: this.getPlanLimits(data.plan || 'free')
    };
    
    this.customers.set(customerId, customer);
    this.apiKeys.set(publishableKey, { customerId, type: 'publishable' });
    this.apiKeys.set(secretKey, { customerId, type: 'secret' });
    
    return customer;
  }

  getCustomerByApiKey(apiKey) {
    const keyData = this.apiKeys.get(apiKey);
    if (!keyData) return null;
    return this.customers.get(keyData.customerId);
  }

  // Room Management
  createRoom(customerId, data) {
    const roomId = `room_${crypto.randomUUID()}`;
    const room = {
      id: roomId,
      customerId,
      name: data.name,
      description: data.description,
      settings: data.settings || {},
      createdAt: new Date().toISOString(),
      lastActivity: new Date().toISOString(),
      memberCount: 0,
      isActive: false
    };
    
    this.rooms.set(roomId, room);
    this.roomMembers.set(roomId, new Set());
    
    return room;
  }

  getRoomsByCustomer(customerId) {
    return Array.from(this.rooms.values())
      .filter(room => room.customerId === customerId);
  }

  joinRoom(roomId, userId, userData) {
    const room = this.rooms.get(roomId);
    if (!room) throw new Error('Room not found');
    
    const members = this.roomMembers.get(roomId);
    members.add(userId);
    
    room.memberCount = members.size;
    room.isActive = members.size > 0;
    room.lastActivity = new Date().toISOString();
    
    this.trackAnalytics(room.customerId, 'room_join', { roomId, userId });
    
    return room;
  }

  leaveRoom(roomId, userId) {
    const room = this.rooms.get(roomId);
    if (!room) return;
    
    const members = this.roomMembers.get(roomId);
    members.delete(userId);
    
    room.memberCount = members.size;
    room.isActive = members.size > 0;
    room.lastActivity = new Date().toISOString();
    
    this.trackAnalytics(room.customerId, 'room_leave', { roomId, userId });
  }

  // Invitation System
  inviteToRoom(roomId, emails, inviterData) {
    const room = this.rooms.get(roomId);
    if (!room) throw new Error('Room not found');
    
    const invitations = emails.map(email => ({
      id: `inv_${crypto.randomUUID()}`,
      roomId,
      roomName: room.name,
      email,
      inviterName: inviterData.name,
      inviterEmail: inviterData.email,
      status: 'pending',
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
    }));
    
    // In production, send actual emails here
    console.log('Invitations sent:', invitations);
    
    return invitations;
  }

  // Analytics
  trackAnalytics(customerId, event, data) {
    if (!this.analytics.has(customerId)) {
      this.analytics.set(customerId, []);
    }
    
    const analytics = this.analytics.get(customerId);
    analytics.push({
      event,
      data,
      timestamp: new Date().toISOString()
    });
    
    // Keep only last 1000 events
    if (analytics.length > 1000) {
      analytics.splice(0, analytics.length - 1000);
    }
  }

  getAnalytics(customerId, timeRange = '7d') {
    const analytics = this.analytics.get(customerId) || [];
    const cutoff = new Date();
    
    switch (timeRange) {
      case '1d': cutoff.setDate(cutoff.getDate() - 1); break;
      case '7d': cutoff.setDate(cutoff.getDate() - 7); break;
      case '30d': cutoff.setDate(cutoff.getDate() - 30); break;
    }
    
    const filtered = analytics.filter(a => new Date(a.timestamp) > cutoff);
    
    return {
      totalEvents: filtered.length,
      uniqueUsers: new Set(filtered.map(a => a.data.userId)).size,
      roomJoins: filtered.filter(a => a.event === 'room_join').length,
      activeRooms: new Set(filtered.map(a => a.data.roomId)).size,
      timeline: this.groupByDay(filtered)
    };
  }

  groupByDay(events) {
    const grouped = {};
    events.forEach(event => {
      const day = event.timestamp.split('T')[0];
      if (!grouped[day]) {
        grouped[day] = { date: day, events: 0, users: new Set() };
      }
      grouped[day].events++;
      if (event.data.userId) {
        grouped[day].users.add(event.data.userId);
      }
    });
    
    return Object.values(grouped).map(day => ({
      date: day.date,
      events: day.events,
      users: day.users.size
    }));
  }

  // Webhooks
  addWebhook(customerId, data) {
    const webhookId = `wh_${crypto.randomUUID()}`;
    const webhook = {
      id: webhookId,
      customerId,
      url: data.url,
      events: data.events || ['room.created', 'room.joined', 'room.left'],
      secret: `whsec_${crypto.randomBytes(16).toString('hex')}`,
      active: true,
      createdAt: new Date().toISOString()
    };
    
    if (!this.webhooks.has(customerId)) {
      this.webhooks.set(customerId, []);
    }
    
    this.webhooks.get(customerId).push(webhook);
    return webhook;
  }

  triggerWebhook(customerId, event, data) {
    const webhooks = this.webhooks.get(customerId) || [];
    const activeWebhooks = webhooks.filter(wh => wh.active && wh.events.includes(event));
    
    activeWebhooks.forEach(webhook => {
      // In production, send HTTP POST to webhook.url
      console.log(`Webhook triggered: ${webhook.url}`, { event, data });
    });
  }

  // Plan Limits
  getPlanLimits(plan) {
    const limits = {
      free: { rooms: 3, concurrentUsers: 10, apiCalls: 1000 },
      pro: { rooms: 100, concurrentUsers: 100, apiCalls: 100000 },
      enterprise: { rooms: -1, concurrentUsers: -1, apiCalls: -1 }
    };
    return limits[plan] || limits.free;
  }

  checkLimits(customerId, resource) {
    const customer = this.customers.get(customerId);
    if (!customer) return false;
    
    const limits = customer.limits;
    
    switch (resource) {
      case 'rooms':
        if (limits.rooms === -1) return true;
        return this.getRoomsByCustomer(customerId).length < limits.rooms;
      case 'users':
        if (limits.concurrentUsers === -1) return true;
        // Check current concurrent users across all rooms
        return true; // Simplified for demo
      default:
        return true;
    }
  }
}

module.exports = MultiTenantService;