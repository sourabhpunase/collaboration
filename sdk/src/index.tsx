import React, { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';

// Types
interface CollabFlowConfig {
  apiKey: string;
  baseUrl?: string;
}

interface Project {
  id: string;
  name: string;
  description: string;
  members: string[];
}

interface CollabFlowContextType {
  createProject: (data: { name: string; description: string }) => Promise<Project>;
  inviteUsers: (projectId: string, userIds: string[]) => Promise<void>;
  reviewChanges: (projectId: string) => Promise<any[]>;
  approveChange: (changeId: string, feedback?: string) => Promise<void>;
  rejectChange: (changeId: string, feedback: string) => Promise<void>;
  isLoading: boolean;
}

// Context
const CollabFlowContext = createContext<CollabFlowContextType | null>(null);

// Provider Component
export const CollabFlowProvider: React.FC<{
  apiUrl?: string;
  children: React.ReactNode;
}> = ({ apiUrl = 'https://api.collabflow.dev', children }) => {
  const [isLoading, setIsLoading] = useState(false);

  const apiCall = async (endpoint: string, options: RequestInit = {}) => {
    const response = await fetch(`${apiUrl}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
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

  const createProject = async (data: { name: string; description: string }) => {
    setIsLoading(true);
    try {
      const result = await apiCall('/projects', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      return result.project;
    } finally {
      setIsLoading(false);
    }
  };

  const inviteUsers = async (projectId: string, userIds: string[]) => {
    setIsLoading(true);
    try {
      await apiCall(`/projects/${projectId}/invite`, {
        method: 'POST',
        body: JSON.stringify({ userIds }),
      });
    } finally {
      setIsLoading(false);
    }
  };

  const reviewChanges = async (projectId: string) => {
    const result = await apiCall(`/projects/${projectId}/staged-changes`);
    return result.changes || [];
  };

  const approveChange = async (changeId: string, feedback?: string) => {
    await apiCall(`/staged-changes/${changeId}`, {
      method: 'PUT',
      body: JSON.stringify({ approve: true, feedback }),
    });
  };

  const rejectChange = async (changeId: string, feedback: string) => {
    await apiCall(`/staged-changes/${changeId}`, {
      method: 'PUT',
      body: JSON.stringify({ approve: false, feedback }),
    });
  };

  const value = {
    createProject,
    inviteUsers,
    reviewChanges,
    approveChange,
    rejectChange,
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

export const ReviewPanel: React.FC<{
  projectId: string;
  className?: string;
}> = ({ projectId, className = '' }) => {
  const { reviewChanges, approveChange, rejectChange } = useCollabFlow();
  const [changes, setChanges] = useState<any[]>([]);

  useEffect(() => {
    reviewChanges(projectId).then(setChanges);
  }, [projectId]);

  return (
    <div className={`review-panel ${className}`}>
      <h3 className="text-lg font-bold mb-4">Pending Changes ({changes.length})</h3>
      {changes.map((change) => (
        <div key={change.id} className="border rounded-lg p-4 mb-4">
          <div className="flex justify-between items-start mb-2">
            <div>
              <h4 className="font-semibold">{change.userName}</h4>
              <p className="text-sm text-gray-600">{new Date(change.createdAt).toLocaleString()}</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => approveChange(change.id)}
                className="bg-green-500 text-white px-3 py-1 rounded text-sm"
              >
                Approve
              </button>
              <button
                onClick={() => {
                  const feedback = prompt('Rejection reason:');
                  if (feedback) rejectChange(change.id, feedback);
                }}
                className="bg-red-500 text-white px-3 py-1 rounded text-sm"
              >
                Reject
              </button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <h5 className="font-medium text-red-700">Original</h5>
              <pre className="bg-red-50 p-2 rounded text-xs">{change.originalContent}</pre>
            </div>
            <div>
              <h5 className="font-medium text-green-700">Proposed</h5>
              <pre className="bg-green-50 p-2 rounded text-xs">{change.proposedContent}</pre>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};