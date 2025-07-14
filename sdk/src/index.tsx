import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import io from 'socket.io-client';

// Types
interface CollabFlowConfig {
  publishableKey: string;
  baseUrl?: string;
}

interface Room {
  id: string;
  name: string;
  description: string;
  members: string[];
  cursors: Map<string, CursorData>;
}

interface CursorData {
  x: number;
  y: number;
  user: {
    id: string;
    name: string;
    color: string;
  };
}

interface CollabFlowContextType {
  // Room Management (like Clerk's user management)
  createRoom: (data: { name: string; description: string }) => Promise<Room>;
  joinRoom: (roomId: string) => Promise<void>;
  leaveRoom: (roomId: string) => Promise<void>;
  inviteUsers: (roomId: string, emails: string[]) => Promise<void>;
  
  // Real-time Features
  cursors: Map<string, CursorData>;
  onlineUsers: string[];
  trackCursor: (x: number, y: number) => void;
  sendMessage: (message: string) => void;
  
  // Content Sync
  content: string;
  updateContent: (content: string) => void;
  
  // State
  isConnected: boolean;
  currentRoom: Room | null;
  isLoading: boolean;
}

// Context
const CollabFlowContext = createContext<CollabFlowContextType | null>(null);

// Provider Component (Like Clerk's ClerkProvider)
export const CollabFlowProvider: React.FC<{
  publishableKey: string;
  baseUrl?: string;
  children: React.ReactNode;
}> = ({ publishableKey, baseUrl = 'https://api.collabflow.dev', children }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [currentRoom, setCurrentRoom] = useState<Room | null>(null);
  const [cursors, setCursors] = useState<Map<string, CursorData>>(new Map());
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [content, setContent] = useState('');
  const socketRef = useRef<any>(null);

  useEffect(() => {
    // Initialize socket connection
    socketRef.current = io(baseUrl, {
      auth: { publishableKey }
    });

    socketRef.current.on('connect', () => setIsConnected(true));
    socketRef.current.on('disconnect', () => setIsConnected(false));
    
    socketRef.current.on('cursor-update', (data: CursorData) => {
      setCursors(prev => new Map(prev.set(data.user.id, data)));
    });
    
    socketRef.current.on('user-joined', (userId: string) => {
      setOnlineUsers(prev => [...prev, userId]);
    });
    
    socketRef.current.on('user-left', (userId: string) => {
      setOnlineUsers(prev => prev.filter(id => id !== userId));
      setCursors(prev => {
        const newCursors = new Map(prev);
        newCursors.delete(userId);
        return newCursors;
      });
    });
    
    socketRef.current.on('content-update', (newContent: string) => {
      setContent(newContent);
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, [baseUrl, publishableKey]);

  const apiCall = async (endpoint: string, options: RequestInit = {}) => {
    const response = await fetch(`${baseUrl}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${publishableKey}`,
        ...options.headers,
      },
      ...options,
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'API call failed');
    }
    
    return response.json();
  };

  const createRoom = async (data: { name: string; description: string }) => {
    setIsLoading(true);
    try {
      const result = await apiCall('/rooms', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      return result.room;
    } finally {
      setIsLoading(false);
    }
  };

  const joinRoom = async (roomId: string) => {
    setIsLoading(true);
    try {
      const result = await apiCall(`/rooms/${roomId}/join`, {
        method: 'POST',
      });
      setCurrentRoom(result.room);
      socketRef.current?.emit('join-room', roomId);
    } finally {
      setIsLoading(false);
    }
  };

  const leaveRoom = async (roomId: string) => {
    socketRef.current?.emit('leave-room', roomId);
    setCurrentRoom(null);
    setCursors(new Map());
    setOnlineUsers([]);
  };

  const inviteUsers = async (roomId: string, emails: string[]) => {
    setIsLoading(true);
    try {
      await apiCall(`/rooms/${roomId}/invite`, {
        method: 'POST',
        body: JSON.stringify({ emails }),
      });
    } finally {
      setIsLoading(false);
    }
  };

  const trackCursor = (x: number, y: number) => {
    if (socketRef.current && currentRoom) {
      socketRef.current.emit('cursor-move', {
        roomId: currentRoom.id,
        x,
        y,
        timestamp: Date.now()
      });
    }
  };

  const sendMessage = (message: string) => {
    if (socketRef.current && currentRoom) {
      socketRef.current.emit('message', {
        roomId: currentRoom.id,
        message,
        timestamp: Date.now()
      });
    }
  };

  const updateContent = (newContent: string) => {
    setContent(newContent);
    if (socketRef.current && currentRoom) {
      socketRef.current.emit('content-change', {
        roomId: currentRoom.id,
        content: newContent,
        timestamp: Date.now()
      });
    }
  };

  const value = {
    createRoom,
    joinRoom,
    leaveRoom,
    inviteUsers,
    cursors,
    onlineUsers,
    trackCursor,
    sendMessage,
    content,
    updateContent,
    isConnected,
    currentRoom,
    isLoading,
  };

  return (
    <CollabFlowContext.Provider value={value}>
      {children}
    </CollabFlowContext.Provider>
  );
};

// Hook
export const useCollabFlow = () => {
  const context = useContext(CollabFlowContext);
  if (!context) {
    throw new Error('useCollabFlow must be used within CollabFlowProvider');
  }
  return context;
};

// Pre-built Components
export const CollabEditor: React.FC<{
  projectId: string;
  className?: string;
}> = ({ projectId, className = '' }) => {
  const [content, setContent] = useState('');
  const [socket, setSocket] = useState<any>(null);

  useEffect(() => {
    const newSocket = io('http://localhost:3000');
    setSocket(newSocket);

    newSocket.emit('join-project', { projectId });
    newSocket.on('content-update', ({ content: newContent }) => {
      setContent(newContent);
    });

    return () => newSocket.close();
  }, [projectId]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setContent(newContent);
    if (socket) {
      socket.emit('content-change', { content: newContent });
    }
  };

  return (
    <div className={`collab-editor ${className}`}>
      <textarea
        value={content}
        onChange={handleChange}
        className="w-full h-64 p-4 border rounded-lg font-mono"
        placeholder="Start collaborating..."
      />
    </div>
  );
};

// Advanced Collaboration Components
export { default as CollabRoom } from './components/CollabRoom';

// Cursor Hook for advanced usage
export const useCursors = () => {
  const { cursors, trackCursor } = useCollabFlow();
  return { cursors, trackCursor };
};

// Presence Hook
export const usePresence = () => {
  const { onlineUsers, isConnected } = useCollabFlow();
  return { onlineUsers, isConnected };
};

// Room Hook
export const useRoom = () => {
  const { currentRoom, joinRoom, leaveRoom } = useCollabFlow();
  return { currentRoom, joinRoom, leaveRoom };
};