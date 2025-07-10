import React, { useState, useEffect } from 'react';
import { Users,ArrowLeft, Send, Plus, FileText, X, Check, Clock, Edit, Trash2, Eye, UserPlus } from 'lucide-react';
import io from 'socket.io-client';

const CollaborationApp = ({ user, getAllUsers }) => {
  const [projects, setProjects] = useState([]);
  const [invitations, setInvitations] = useState([]);
  const [activeProject, setActiveProject] = useState(null);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Modals
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [showChangesModal, setShowChangesModal] = useState(false);
  
  // Form states
  const [newProject, setNewProject] = useState({ name: '', description: '' });
  const [selectedProject, setSelectedProject] = useState(null);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [pendingChanges, setPendingChanges] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const apiCall = async (url, options = {}) => {
    const token = localStorage.getItem('authToken');
    const response = await fetch(`http://localhost:3000${url}`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers
      },
      ...options
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Request failed');
    }
    
    return response.json();
  };

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');
      
      const [projectsRes, invitationsRes] = await Promise.all([
        apiCall('/projects'),
        apiCall('/invitations')
      ]);
      
      setProjects(projectsRes.projects || []);
      setInvitations(invitationsRes.invitations || []);

      if (user?.role === 'superadmin') {
        const usersRes = await getAllUsers();
        setAllUsers(usersRes.users.filter(u => u.id !== user.id));
      }
    } catch (error) {
      setError('Failed to load data: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (message, isError = false) => {
    if (isError) {
      setError(message);
      setTimeout(() => setError(''), 5000);
    } else {
      setSuccess(message);
      setTimeout(() => setSuccess(''), 3000);
    }
  };

  const createProject = async (e) => {
    e.preventDefault();
    if (!newProject.name.trim() || !newProject.description.trim()) {
      showMessage('Please fill in all fields', true);
      return;
    }

    try {
      setLoading(true);
      await apiCall('/projects', {
        method: 'POST',
        body: JSON.stringify(newProject)
      });
      
      setNewProject({ name: '', description: '' });
      setShowCreateForm(false);
      showMessage('Project created successfully!');
      loadData();
    } catch (error) {
      showMessage('Failed to create project: ' + error.message, true);
    } finally {
      setLoading(false);
    }
  };

  const openInviteModal = (project) => {
    setSelectedProject(project);
    setSelectedUsers([]);
    setShowInviteModal(true);
  };

  const inviteUsers = async () => {
    if (!selectedProject || selectedUsers.length === 0) {
      showMessage('Please select users to invite', true);
      return;
    }

    try {
      setLoading(true);
      const response = await apiCall(`/projects/${selectedProject.id}/invite`, {
        method: 'POST',
        body: JSON.stringify({ userIds: selectedUsers })
      });
      
      setShowInviteModal(false);
      setSelectedUsers([]);
      setSelectedProject(null);
      showMessage(`${response.invitations} invitations sent successfully!`);
      loadData();
    } catch (error) {
      showMessage('Failed to send invitations: ' + error.message, true);
    } finally {
      setLoading(false);
    }
  };

  const respondToInvitation = async (invitationId, accept) => {
    try {
      setLoading(true);
      const response = await apiCall(`/invitations/${invitationId}`, {
        method: 'PUT',
        body: JSON.stringify({ accept })
      });
      
      showMessage(response.message);
      loadData();
    } catch (error) {
      showMessage('Failed to respond to invitation: ' + error.message, true);
    } finally {
      setLoading(false);
    }
  };

  const openProject = async (project) => {
    try {
      setLoading(true);
      const response = await apiCall(`/projects/${project.id}`);
      const projectData = { ...response.project, showChangesOnOpen: project.hasStagedChanges && user?.role === 'superadmin' };
      setActiveProject(projectData);
    } catch (error) {
      showMessage('Failed to open project: ' + error.message, true);
    } finally {
      setLoading(false);
    }
  };

  const showProjectMembers = (project) => {
    setSelectedProject(project);
    setShowMembersModal(true);
  };

  const loadPendingChanges = async () => {
    try {
      setLoading(true);
      const allChanges = [];
      
      for (const project of projects) {
        try {
          const response = await apiCall(`/projects/${project.id}/staged-changes`);
          if (response.success && response.changes?.length > 0) {
            allChanges.push(...response.changes.map(change => ({
              ...change,
              projectName: project.name,
              projectId: project.id
            })));
          }
        } catch (error) {
          // No pending changes for this project
        }
      }
      
      setPendingChanges(allChanges);
      setShowChangesModal(true);
    } catch (error) {
      showMessage('Failed to load pending changes: ' + error.message, true);
    } finally {
      setLoading(false);
    }
  };

  const reviewChange = async (changeId, approve) => {
    try {
      setLoading(true);
      const response = await apiCall(`/staged-changes/${changeId}`, {
        method: 'PUT',
        body: JSON.stringify({ approve })
      });
      
      setPendingChanges(prev => prev.filter(change => change.id !== changeId));
      showMessage(response.message);
      loadData();
    } catch (error) {
      showMessage('Failed to review changes: ' + error.message, true);
    } finally {
      setLoading(false);
    }
  };

  if (activeProject) {
    return <ProjectEditor project={activeProject} user={user} onBack={() => setActiveProject(null)} />;
  }

  return (
    <div className="page-container">
      <div className="container">
        {/* Header */}
        <div className="header">
          <div className="header-content">
            <div>
              <h1 className="header-title">Collaboration Hub</h1>
              <p className="header-subtitle">Real-time project collaboration platform</p>
              <div className="flex items-center gap-3 mt-4">
                <span className="badge badge-primary">
                  {projects.length} Projects
                </span>
                {invitations.length > 0 && (
                  <span className="badge badge-warning">
                    {invitations.length} Pending Invitations
                  </span>
                )}
                {user?.role === 'superadmin' && (
                  <span className="badge badge-danger">
                    Super Admin
                  </span>
                )}
              </div>
            </div>
            
            {user?.role === 'superadmin' && (
              <div className="flex gap-3">
                <button
                  onClick={() => setShowCreateForm(true)}
                  disabled={loading}
                  className="btn btn-primary"
                >
                  <Plus className="w-4 h-4" />
                  New Project
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Messages */}
        {error && (
          <div className="notification notification-error">
            {error}
          </div>
        )}
        {success && (
          <div className="notification notification-success">
            {success}
          </div>
        )}

        {/* Invitations */}
        {invitations.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-orange-600" />
              Project Invitations ({invitations.length})
            </h2>
            <div className="grid gap-4">
              {invitations.map((inv) => (
                <div key={inv.id} className="invitation-card">
                  <div className="invitation-header">
                    <div>
                      <h3 className="invitation-title text-lg font-semibold">{inv.projectName}</h3>
                      <p className="text-amber-700 text-sm">{inv.projectDescription}</p>
                      <div className="flex items-center gap-4 text-xs text-amber-600 mt-2">
                        <span>From {inv.inviterName}</span>
                        <span>{new Date(inv.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="invitation-actions">
                      <button
                        onClick={() => respondToInvitation(inv.id, true)}
                        disabled={loading}
                        className="btn btn-success btn-sm"
                      >
                        <Check className="w-4 h-4" />
                        Accept
                      </button>
                      <button
                        onClick={() => respondToInvitation(inv.id, false)}
                        disabled={loading}
                        className="btn btn-outline btn-sm"
                      >
                        <X className="w-4 h-4" />
                        Decline
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Create Project Form */}
        {showCreateForm && (
          <div className="card mb-8">
            <div className="card-header">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                  <Plus className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold">Create New Project</h2>
                  <p className="text-gray-600 text-sm">Start a new collaboration</p>
                </div>
              </div>
            </div>
            
            <form onSubmit={createProject}>
              <div className="form-group">
                <label className="form-label">Project Name</label>
                <input
                  type="text"
                  value={newProject.name}
                  onChange={(e) => setNewProject({...newProject, name: e.target.value})}
                  className="input"
                  placeholder="Enter project name"
                  required
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  value={newProject.description}
                  onChange={(e) => setNewProject({...newProject, description: e.target.value})}
                  className="input textarea"
                  placeholder="Describe your project"
                  required
                />
              </div>
              
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary"
                >
                  {loading ? <div className="spinner" /> : <Plus className="w-4 h-4" />}
                  Create Project
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="btn btn-outline"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Projects Grid */}
        <div className="grid grid-3">
          {loading && projects.length === 0 ? (
            <div className="col-span-full text-center py-16">
              <div className="spinner mx-auto mb-4"></div>
              <p className="text-gray-600">Loading projects...</p>
            </div>
          ) : projects.length === 0 ? (
            <div className="col-span-full text-center py-16">
              <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Projects Yet</h3>
              <p className="text-gray-600 max-w-md mx-auto">
                {user?.role === 'superadmin' 
                  ? 'Create your first project to start collaborating'
                  : 'You\'ll see projects here when invited to collaborate'
                }
              </p>
            </div>
          ) : (
            projects.map((project) => (
              <div key={project.id} className="project-card">
                <div className="flex justify-between items-start mb-4">
                  <div className="project-icon">
                    <FileText className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => showProjectMembers(project)}
                      className="btn btn-outline btn-sm"
                      title="View members"
                    >
                      <Users className="w-4 h-4" />
                    </button>
                    {user?.role === 'superadmin' && (
                      <button
                        onClick={() => openInviteModal(project)}
                        className="btn btn-success btn-sm"
                        title="Invite users"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
                
                <h3 className="project-title">{project.name}</h3>
                <p className="project-description">{project.description}</p>
                
                <div className="project-meta">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      <span>{project.members?.length || 1}</span>
                    </div>
                    {project.hasStagedChanges && (
                      <span className="badge badge-warning">
                        Pending
                      </span>
                    )}
                  </div>
                  <span>{new Date(project.createdAt).toLocaleDateString()}</span>
                </div>
                
                <div className="project-actions">
                  <button
                    onClick={() => openProject(project)}
                    disabled={loading}
                    className="btn btn-primary w-full"
                  >
                    <Edit className="w-4 h-4" />
                    Open Project
                  </button>
                  {user?.role === 'superadmin' && project.hasStagedChanges && (
                    <button
                      onClick={async () => {
                        try {
                          const response = await apiCall(`/projects/${project.id}/staged-changes`);
                          if (response.success && response.changes?.length > 0) {
                            const changes = response.changes;
                            const changesList = changes.map(c => `• ${c.userName}: ${new Date(c.createdAt).toLocaleString()}`).join('\n');
                            if (confirm(`Review ${changes.length} pending changes for "${project.name}"?\n\n${changesList}`)) {
                              openProject(project);
                            }
                          }
                        } catch (error) {
                          showMessage('Failed to load changes: ' + error.message, true);
                        }
                      }}
                      className="btn btn-warning btn-sm mt-2 w-full"
                    >
                      <Clock className="w-4 h-4" />
                      Review Changes
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Invite Modal */}
        {showInviteModal && selectedProject && (
          <div className="modal-overlay">
            <div className="invite-modal">
              <div className="invite-modal-header">
                <div className="invite-header-content">
                  <div className="invite-icon">
                    <Send className="w-5 h-5 text-white" />
                  </div>
                  <div className="invite-title">
                    <h3>Invite Users</h3>
                    <p>to {selectedProject.name}</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowInviteModal(false)}
                  className="invite-close-btn"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              
              <div className="invite-modal-body">
                <div className="invite-search">
                  <input
                    type="text"
                    placeholder="Search users..."
                    className="invite-search-input"
                  />
                </div>
                
                <div className="invite-users-list">
                  {allUsers.filter(u => !selectedProject.members?.includes(u.id)).map((dbUser) => (
                    <div key={dbUser.id} className="invite-user-item">
                      <label className="invite-user-label">
                        <input
                          type="checkbox"
                          checked={selectedUsers.includes(dbUser.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedUsers([...selectedUsers, dbUser.id]);
                            } else {
                              setSelectedUsers(selectedUsers.filter(id => id !== dbUser.id));
                            }
                          }}
                          className="invite-checkbox"
                        />
                        <div className="invite-user-avatar">
                          {(dbUser.firstName || 'U').charAt(0)}{(dbUser.lastName || 'U').charAt(0)}
                        </div>
                        <div className="invite-user-info">
                          <div className="invite-user-name">{dbUser.fullName}</div>
                          <div className="invite-user-email">{dbUser.email}</div>
                        </div>
                        {selectedUsers.includes(dbUser.id) && (
                          <div className="invite-selected-icon">
                            <Check className="w-4 h-4" />
                          </div>
                        )}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="invite-modal-footer">
                <div className="invite-selected-count">
                  {selectedUsers.length} user{selectedUsers.length !== 1 ? 's' : ''} selected
                </div>
                <div className="invite-actions">
                  <button
                    onClick={() => setShowInviteModal(false)}
                    className="btn btn-outline"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={inviteUsers}
                    disabled={selectedUsers.length === 0 || loading}
                    className="btn btn-primary"
                  >
                    {loading ? <div className="spinner" /> : <Send className="w-4 h-4" />}
                    Send Invitations
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Members Modal */}
        {showMembersModal && selectedProject && (
          <div className="modal-overlay">
            <div className="modal" style={{maxWidth: '400px'}}>
              <div className="modal-header">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                    <Users className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">Project Members</h3>
                    <p className="text-gray-600 text-sm">{selectedProject.name}</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowMembersModal(false)}
                  className="btn btn-outline btn-sm !p-2"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              
              <div className="modal-body">
                <div className="space-y-3">
                  {selectedProject.memberNames?.map((name, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-10 h-10 bg-indigo-500 rounded-lg flex items-center justify-center text-white font-semibold text-sm">
                        {(name || 'U').charAt(0)}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          {selectedProject.createdBy === selectedProject.members?.[index] ? (
                            <span className="badge badge-primary">
                              Owner
                            </span>
                          ) : (
                            <span className="badge badge-success">
                              Member
                            </span>
                          )}
                          <div className="status-online"></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Pending Changes Modal */}
        {showChangesModal && (
          <div className="modal-overlay">
            <div className="modal" style={{maxWidth: '800px'}}>
              <div className="modal-header">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
                    <Clock className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">Pending Changes Review</h3>
                    <p className="text-gray-600 text-sm">Review and approve user contributions</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowChangesModal(false)}
                  className="btn btn-outline btn-sm !p-2"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              
              <div className="modal-body">
                {pendingChanges.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                      <Check className="w-8 h-8 text-green-600" />
                    </div>
                    <h4 className="text-lg font-semibold mb-2">All Caught Up!</h4>
                    <p className="text-gray-600">No pending changes to review</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {pendingChanges.map((change) => (
                      <div key={change.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center text-white font-semibold text-sm">
                              {(change.userName || 'U').charAt(0)}
                            </div>
                            <div>
                              <h4 className="font-semibold">{change.projectName}</h4>
                              <p className="text-gray-600 text-sm">By {change.userName}</p>
                              <p className="text-gray-500 text-xs">{new Date(change.createdAt).toLocaleString()}</p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => reviewChange(change.id, true)}
                              disabled={loading}
                              className="btn btn-success btn-sm"
                            >
                              <Check className="w-4 h-4" />
                              Approve
                            </button>
                            <button
                              onClick={() => reviewChange(change.id, false)}
                              disabled={loading}
                              className="btn btn-danger btn-sm"
                            >
                              <X className="w-4 h-4" />
                              Reject
                            </button>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                          <div>
                            <h5 className="font-medium mb-2 text-sm">Original Content</h5>
                            <div className="bg-gray-50 p-3 rounded-lg max-h-32 overflow-y-auto">
                              <pre className="text-gray-800 text-xs whitespace-pre-wrap">{change.originalContent}</pre>
                            </div>
                          </div>
                          <div>
                            <h5 className="font-medium mb-2 text-sm">Proposed Changes</h5>
                            <div className="bg-green-50 border border-green-200 p-3 rounded-lg max-h-32 overflow-y-auto">
                              <pre className="text-gray-800 text-xs whitespace-pre-wrap">{change.proposedContent}</pre>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Real-time Project Editor
const ProjectEditor = ({ project, user, onBack }) => {
  const [content, setContent] = useState(project.content || '');
  const [socket, setSocket] = useState(null);
  const [collaborators, setCollaborators] = useState([]);
  const [cursors, setCursors] = useState({});
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(new Date());
  const [comments, setComments] = useState([]);
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [selectedText, setSelectedText] = useState({ text: '', start: 0, end: 0 });
  const [newComment, setNewComment] = useState('');
  const [editorRef, setEditorRef] = useState(null);
  const [typingUsers, setTypingUsers] = useState(new Set());
  const [wordCount, setWordCount] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState(null);
  const [projectChanges, setProjectChanges] = useState([]);
  const [showChangesPanel, setShowChangesPanel] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState([]);
  const [darkMode, setDarkMode] = useState(false);
  const [textToSpeech, setTextToSpeech] = useState(false);
  const [speechToText, setSpeechToText] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recognition, setRecognition] = useState(null);

  const [focusMode, setFocusMode] = useState(false);
  const [showMinimap, setShowMinimap] = useState(false);
  const [aiAssistant, setAiAssistant] = useState(false);
  const [smartSuggestions, setSmartSuggestions] = useState([]);
  const [readingMode, setReadingMode] = useState(false);

  useEffect(() => {
    const newSocket = io('http://localhost:3000');
    setSocket(newSocket);

    newSocket.emit('join-project', {
      projectId: project.id,
      user: { id: user.id, name: user.fullName, color: getRandomColor() }
    });

    newSocket.on('room-users', (users) => {
      setCollaborators(users);
    });

    newSocket.on('user-joined', ({ user: newUser }) => {
      setCollaborators(prev => [...prev, newUser]);
    });

    newSocket.on('user-left', ({ socketId }) => {
      setCollaborators(prev => prev.filter(u => u.socketId !== socketId));
      setCursors(prev => {
        const newCursors = { ...prev };
        delete newCursors[socketId];
        return newCursors;
      });
    });

    newSocket.on('content-update', ({ content: newContent, user: updateUser, cursorPosition }) => {
      if (updateUser.id !== user.id) {
        setContent(newContent);
      }
    });

    newSocket.on('cursor-update', ({ x, y, socketId, user: cursorUser, textPosition }) => {
      setCursors(prev => ({
        ...prev,
        [socketId]: { x, y, user: cursorUser, textPosition }
      }));
    });

    newSocket.on('comment-added', (comment) => {
      setComments(prev => [...prev, comment]);
    });

    newSocket.on('comment-deleted', ({ commentId }) => {
      setComments(prev => prev.filter(c => c.id !== commentId));
    });

    newSocket.on('user-typing', ({ socketId, isTyping: userTyping, user: typingUser }) => {
      setTypingUsers(prev => {
        const newSet = new Set(prev);
        if (userTyping) {
          newSet.add(socketId);
        } else {
          newSet.delete(socketId);
        }
        return newSet;
      });
    });

    newSocket.on('cursor-position', ({ socketId, textPosition, user: cursorUser }) => {
      setCursors(prev => ({
        ...prev,
        [socketId]: { ...prev[socketId], textPosition, user: cursorUser }
      }));
    });

    newSocket.on('history-updated', () => {
      loadHistory();
    });

    newSocket.on('content-saved', ({ userName, timestamp }) => {
      // Add to local history immediately
      const newHistoryEntry = {
        id: Date.now().toString(),
        type: 'edit',
        userName,
        timestamp,
        editType: 'direct_edit'
      };
      setHistory(prev => [newHistoryEntry, ...prev.slice(0, 49)]);
    });

    // Load existing comments and project data
    loadComments();
    loadProjectChanges();
    loadHistory();
    initializeSpeechFeatures();

    // Auto-show changes panel if project has pending changes
    if (project.showChangesOnOpen && user?.role === 'superadmin') {
      setShowChangesPanel(true);
    }

    return () => {
      newSocket.close();
      if (recognition) {
        recognition.stop();
      }
    };
  }, [project.id, user.id, user.fullName]);

  const loadComments = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`http://localhost:3000/projects/${project.id}/comments`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setComments(result.comments || []);
        }
      } else {
        console.warn('Comments endpoint not available, using empty array');
        setComments([]);
      }
    } catch (error) {
      console.error('Failed to load comments:', error);
      setComments([]);
    }
  };

  const handleContentChange = (e) => {
    const newContent = e.target.value;
    const cursorPosition = e.target.selectionStart;
    
    // Update content immediately
    setContent(newContent);
    
    // Update word count
    const words = newContent.trim().split(/\s+/).filter(word => word.length > 0);
    setWordCount(words.length);
    
    // Handle typing indicator
    if (!isTyping) {
      setIsTyping(true);
      if (socket) {
        socket.emit('user-typing', { isTyping: true });
      }
    }
    
    // Clear existing timeout
    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }
    
    // Set new timeout to stop typing indicator
    const timeout = setTimeout(() => {
      setIsTyping(false);
      if (socket) {
        socket.emit('user-typing', { isTyping: false });
      }
    }, 1000);
    setTypingTimeout(timeout);
    
    // Emit content change to other users
    if (socket) {
      socket.emit('content-change', {
        content: newContent,
        cursorPosition
      });
    }
  };

  const handleMouseMove = (e) => {
    if (socket && editorRef) {
      const rect = editorRef.getBoundingClientRect();
      const relativeX = Math.max(0, e.clientX - rect.left - 16);
      const relativeY = Math.max(0, e.clientY - rect.top - 16);
      
      const textPosition = getTextPositionFromCoords(relativeX, relativeY);
      
      socket.emit('cursor-move', {
        x: e.clientX,
        y: e.clientY,
        relativeX,
        relativeY,
        textPosition,
        editorBounds: {
          left: rect.left,
          top: rect.top,
          width: rect.width,
          height: rect.height
        }
      });
    }
  };

  const getTextPositionFromCoords = (x, y) => {
    if (!editorRef || !content) return 0;
    
    try {
      const lineHeight = 24;
      const charWidth = 8.5;
      const line = Math.max(0, Math.floor(y / lineHeight));
      const char = Math.max(0, Math.floor(x / charWidth));
      
      const lines = content.split('\n');
      if (lines.length === 0) return 0;
      
      let position = 0;
      
      for (let i = 0; i < line && i < lines.length; i++) {
        position += (lines[i] || '').length + 1;
      }
      
      if (line < lines.length && lines[line]) {
        position += Math.min(char, lines[line].length);
      }
      
      return Math.max(0, Math.min(position, content.length));
    } catch (error) {
      console.warn('Error calculating text position:', error);
      return 0;
    }
  };

  const handleTextSelection = () => {
    if (!editorRef) return;
    
    const start = editorRef.selectionStart;
    const end = editorRef.selectionEnd;
    
    if (start !== end && start < end) {
      const selectedText = content.substring(start, end);
      if (selectedText.trim().length > 0) {
        setSelectedText({ 
          text: selectedText.trim(), 
          start, 
          end 
        });
        console.log('Text selected:', selectedText.trim());
      }
    } else {
      // Clear selection if no text is selected
      setSelectedText({ text: '', start: 0, end: 0 });
    }
  };

  const addComment = async () => {
    if (!newComment.trim() || !selectedText.text) {
      alert('Please enter a comment and select text');
      return;
    }
    
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`http://localhost:3000/projects/${project.id}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          text: newComment.trim(),
          selectedText: selectedText.text.trim(),
          startPosition: selectedText.start || 0,
          endPosition: selectedText.end || selectedText.text.length
        })
      });
      
      if (response.ok) {
        const result = await response.json();
        if (result.success && result.comment) {
          // Add comment to local state immediately
          setComments(prev => [...prev, result.comment]);
          
          // Clear form
          setNewComment('');
          setShowCommentModal(false);
          setSelectedText({ text: '', start: 0, end: 0 });
          
          // Broadcast to other users
          if (socket) {
            socket.emit('comment-added', result.comment);
          }
          
          alert('Comment added successfully!');
        } else {
          alert('Failed to add comment: ' + (result.message || 'Unknown error'));
        }
      } else {
        const errorResult = await response.json();
        alert('Failed to add comment: ' + (errorResult.message || 'Server error'));
      }
    } catch (error) {
      console.error('Add comment error:', error);
      alert('Failed to add comment: ' + error.message);
    }
  };

  const deleteComment = async (commentId) => {
    if (!user || (user.role !== 'superadmin' && user.role !== 'admin')) {
      alert('Only admins can delete comments');
      return;
    }
    
    if (!confirm('Are you sure you want to delete this comment?')) {
      return;
    }
    
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`http://localhost:3000/projects/${project.id}/comments/${commentId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          // Remove comment from local state
          setComments(prev => prev.filter(c => c.id !== commentId));
          
          // Broadcast to other users
          if (socket) {
            socket.emit('comment-deleted', { commentId });
          }
          
          alert('Comment deleted successfully!');
        }
      } else {
        const errorResult = await response.json();
        alert('Failed to delete comment: ' + (errorResult.message || 'Server error'));
      }
    } catch (error) {
      console.error('Delete comment error:', error);
      alert('Failed to delete comment: ' + error.message);
    }
  };

  const loadProjectChanges = async () => {
    if (user?.role === 'superadmin') {
      try {
        const token = localStorage.getItem('authToken');
        const response = await fetch(`http://localhost:3000/projects/${project.id}/staged-changes`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.ok) {
          const result = await response.json();
          if (result.success) {
            setProjectChanges(result.changes || []);
          }
        } else {
          setProjectChanges([]);
        }
      } catch (error) {
        console.error('Failed to load project changes:', error);
        setProjectChanges([]);
      }
    }
  };

  const approveChangeWithFeedback = async (changeId, feedback = null) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`http://localhost:3000/staged-changes/${changeId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ approve: true, feedback })
      });
      
      const result = await response.json();
      if (result.success) {
        setProjectChanges(prev => prev.filter(change => change.id !== changeId));
        alert('Changes approved and merged successfully!');
        // Reload content and history
        const projectResponse = await fetch(`http://localhost:3000/projects/${project.id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const projectResult = await projectResponse.json();
        if (projectResult.success) {
          setContent(projectResult.project.content);
        }
        loadHistory(); // Refresh history to show the merge
      }
    } catch (error) {
      alert('Failed to approve change: ' + error.message);
    }
  };

  const rejectChangeWithFeedback = async (changeId, feedback) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`http://localhost:3000/staged-changes/${changeId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ approve: false, feedback })
      });
      
      const result = await response.json();
      if (result.success) {
        setProjectChanges(prev => prev.filter(change => change.id !== changeId));
        alert('Changes rejected with feedback!');
        loadHistory(); // Refresh history to show the rejection
      }
    } catch (error) {
      alert('Failed to reject change: ' + error.message);
    }
  };

  // Legacy functions for backward compatibility
  const approveChange = (changeId) => approveChangeWithFeedback(changeId);
  const rejectChange = (changeId) => {
    const feedback = prompt('Reason for rejection:');
    if (feedback) rejectChangeWithFeedback(changeId, feedback);
  };

  // Load project history
  const loadHistory = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const historyRes = await fetch(`http://localhost:3000/projects/${project.id}/history`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (historyRes.ok) {
        const historyResult = await historyRes.json();
        if (historyResult.success) {
          setHistory(historyResult.history || []);
        }
      }
    } catch (error) {
      console.error('Failed to load history:', error);
    }
  };

  // Advanced Features
  const initializeSpeechFeatures = () => {
    if ('speechSynthesis' in window && 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = window.webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      recognitionInstance.continuous = true;
      recognitionInstance.interimResults = true;
      recognitionInstance.lang = 'en-US';
      setRecognition(recognitionInstance);
    }
  };



  const speakText = (text) => {
    if ('speechSynthesis' in window && text.trim()) {
      window.speechSynthesis.cancel();
      
      // Wait for voices to load
      const speak = () => {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.8;
        utterance.pitch = 1;
        utterance.volume = 0.9;
        
        const voices = window.speechSynthesis.getVoices();
        const preferredVoice = voices.find(voice => 
          voice.lang.startsWith('en') && (voice.name.includes('Google') || voice.name.includes('Microsoft'))
        ) || voices.find(voice => voice.lang.startsWith('en')) || voices[0];
        
        if (preferredVoice) {
          utterance.voice = preferredVoice;
        }
        
        utterance.onstart = () => console.log('Speech started');
        utterance.onend = () => console.log('Speech ended');
        utterance.onerror = (e) => console.error('Speech error:', e);
        
        window.speechSynthesis.speak(utterance);
      };
      
      // Ensure voices are loaded
      if (window.speechSynthesis.getVoices().length === 0) {
        window.speechSynthesis.onvoiceschanged = () => {
          speak();
          window.speechSynthesis.onvoiceschanged = null;
        };
      } else {
        speak();
      }
    }
  };

  const startSpeechToText = () => {
    if (!recognition) {
      alert('❌ Speech recognition not supported in this browser');
      return;
    }
    
    if (!isRecording) {
      try {
        setIsRecording(true);
        recognition.start();
        
        recognition.onresult = (event) => {
          let transcript = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
            transcript += event.results[i][0].transcript;
          }
          
          if (event.results[event.results.length - 1].isFinal) {
            const cursorPos = editorRef?.selectionStart || content.length;
            const newContent = content.slice(0, cursorPos) + ' ' + transcript + content.slice(cursorPos);
            setContent(newContent);
            
            if (socket) {
              socket.emit('content-change', { content: newContent });
            }
          }
        };
        
        recognition.onerror = (event) => {
          console.error('Speech recognition error:', event.error);
          setIsRecording(false);
          if (event.error !== 'aborted') {
            alert('❌ Speech recognition error: ' + event.error);
          }
        };
        
        recognition.onend = () => {
          setIsRecording(false);
        };
      } catch (error) {
        console.error('Failed to start speech recognition:', error);
        setIsRecording(false);
        alert('❌ Failed to start speech recognition');
      }
    } else {
      recognition.stop();
      setIsRecording(false);
    }
  };

  const generateSmartSuggestions = async () => {
    if (!content.trim()) {
      setSmartSuggestions([]);
      return;
    }
    
    const suggestions = [];
    const text = content.toLowerCase();
    const lines = content.split('\n');
    
    // Advanced Grammar Analysis
    const grammarIssues = [
      {
        pattern: /\bthere is (multiple|many|several|\d+)/gi,
        suggestion: 'Use "there are" with plural subjects',
        fix: (text) => text.replace(/there is/gi, 'there are'),
        type: 'grammar'
      },
      {
        pattern: /\b(could of|would of|should of)\b/gi,
        suggestion: 'Use "could have", "would have", "should have" instead of "of"',
        fix: (text) => text.replace(/ of\b/gi, ' have'),
        type: 'grammar'
      },
      {
        pattern: /\bi\s+/gi,
        suggestion: 'Capitalize the pronoun "I"',
        fix: (text) => text.replace(/\bi\b/g, 'I'),
        type: 'capitalization'
      }
    ];
    
    // Check each grammar rule
    grammarIssues.forEach(rule => {
      const matches = content.match(rule.pattern);
      if (matches) {
        suggestions.push({
          type: rule.type,
          text: rule.suggestion,
          icon: rule.type === 'grammar' ? '📝' : '🔤',
          fix: rule.fix ? rule.fix(content) : null,
          severity: 'high'
        });
      }
    });
    
    // Style Analysis
    const avgWordsPerSentence = content.split(/[.!?]+/).filter(s => s.trim()).reduce((acc, sentence) => {
      return acc + sentence.trim().split(/\s+/).length;
    }, 0) / Math.max(1, content.split(/[.!?]+/).length - 1);
    
    if (avgWordsPerSentence > 25) {
      suggestions.push({
        type: 'style',
        text: 'Consider shorter sentences for better readability (avg: ' + Math.round(avgWordsPerSentence) + ' words)',
        icon: '✂️',
        severity: 'medium'
      });
    }
    
    // Readability improvements
    const wordCount = content.trim().split(/\s+/).length;
    if (wordCount > 100 && !content.includes('\n\n')) {
      suggestions.push({
        type: 'readability',
        text: 'Add paragraph breaks to improve document structure',
        icon: '📄',
        severity: 'low'
      });
    }
    
    // Passive voice detection
    const passiveMatches = content.match(/\b(was|were|been|being)\s+\w*ed\b/gi);
    if (passiveMatches && passiveMatches.length > 2) {
      suggestions.push({
        type: 'style',
        text: `Found ${passiveMatches.length} instances of passive voice. Consider active voice for clarity`,
        icon: '🎯',
        severity: 'medium'
      });
    }
    
    // AI-powered suggestions (simulated)
    if (content.includes('however') && content.includes('but')) {
      suggestions.push({
        type: 'style',
        text: 'Avoid using both "however" and "but" - choose one for consistency',
        icon: '🔄',
        severity: 'low'
      });
    }
    
    setSmartSuggestions(suggestions.slice(0, 5)); // Limit to 5 suggestions
  };

  const handleEnhancedTextSelection = () => {
    handleTextSelection();
    
    if (textToSpeech && editorRef) {
      const start = editorRef.selectionStart;
      const end = editorRef.selectionEnd;
      
      if (start !== end && start < end) {
        const selectedText = content.substring(start, end);
        if (selectedText.trim().length > 0) {
          speakText(selectedText.trim());
        }
      }
    }
  };

  const saveContent = async (silent = false) => {
    if (saving) return; // Prevent multiple saves
    
    try {
      setSaving(true);
      const token = localStorage.getItem('authToken');
      
      // Add delay to prevent instant action
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const response = await fetch(`http://localhost:3000/projects/${project.id}/content`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ content: content || '' })
      });
      
      if (response.ok) {
        const result = await response.json();
        
        if (result.success) {
          setLastSaved(new Date());
          
          if (socket) {
            socket.emit('content-saved', { userName: user.fullName });
            socket.emit('history-update');
          }
          
          loadHistory();
          
          if (!silent) {
            if (result.staged) {
              alert('✅ Changes submitted for superadmin approval!');
            } else {
              alert('✅ Content saved successfully!');
            }
          }
        } else {
          if (!silent) alert('❌ ' + (result.message || 'Failed to save content'));
        }
      } else {
        const errorResult = await response.json();
        if (!silent) alert('❌ Failed to save: ' + (errorResult.message || 'Server error'));
      }
    } catch (error) {
      if (!silent) alert('❌ Failed to save content: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page-container" onMouseMove={handleMouseMove}>
      {/* Live Cursors */}
      {Object.entries(cursors).map(([socketId, cursor]) => (
        <div
          key={socketId}
          className="live-cursor"
          style={{
            left: cursor.x,
            top: cursor.y,
            transform: 'translate(-50%, -50%)'
          }}
        >
          <div
            className="cursor-pointer"
            style={{ backgroundColor: cursor.user.color }}
          />
          <div className="cursor-name" style={{ backgroundColor: cursor.user.color }}>
            {cursor.user.name}
          </div>
        </div>
      ))}

      <div className="container">
        {/* Header */}
        <div className="card mb-6">
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4">
            <div className="flex items-start gap-4">
              <button
                onClick={onBack}
                className="btn btn-outline btn-sm"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
              <div>
                <h1 className="text-2xl font-bold mb-1">{project.name}</h1>
                <p className="text-gray-600 mb-2">{project.description}</p>
                <p className="text-gray-500 text-sm">Last saved: {lastSaved.toLocaleTimeString()}</p>
              </div>
            </div>
            
            <div className="flex flex-wrap items-center gap-3">
              <div className="badge badge-primary">
                <Users className="w-4 h-4" />
                {collaborators.length} online
              </div>
              
              {user?.role !== 'superadmin' && (
                <div className="badge badge-warning">
                  Requires approval
                </div>
              )}
              
              <button
                onClick={() => {
                  if (selectedText.text && selectedText.text.trim()) {
                    setShowCommentModal(true);
                  } else {
                    // Try to get current selection
                    if (editorRef) {
                      const start = editorRef.selectionStart;
                      const end = editorRef.selectionEnd;
                      
                      if (start !== end && start < end) {
                        const text = content.substring(start, end);
                        if (text.trim()) {
                          setSelectedText({ text: text.trim(), start, end });
                          setShowCommentModal(true);
                          return;
                        }
                      }
                    }
                    alert('Please select some text first, then click Comment');
                  }
                }}
                className={`btn btn-secondary btn-sm ${selectedText.text ? 'btn-success' : ''}`}
              >
                💬 {selectedText.text ? 'Add Comment' : 'Comment'}
              </button>
              
              {user?.role === 'superadmin' && projectChanges.length > 0 && (
                <button
                  onClick={() => setShowChangesPanel(!showChangesPanel)}
                  className="btn btn-warning btn-sm"
                >
                  ⚡ Review Changes ({projectChanges.length})
                </button>
              )}
              
              <button
                onClick={() => {
                  setShowHistory(!showHistory);
                  if (!showHistory) loadHistory();
                }}
                className="btn btn-outline btn-sm"
              >
                📜 History
              </button>
              
              <button
                onClick={() => setTextToSpeech(!textToSpeech)}
                className={`btn btn-sm ${textToSpeech ? 'btn-success' : 'btn-outline'}`}
                title="Text-to-Speech: Select text to hear it"
              >
                🔊 {textToSpeech ? 'TTS On' : 'TTS'}
              </button>
              
              <button
                onClick={startSpeechToText}
                className={`btn btn-sm ${isRecording ? 'btn-danger' : speechToText ? 'btn-success' : 'btn-outline'}`}
                title="Speech-to-Text: Click to start/stop recording"
              >
                🎤 {isRecording ? 'Recording...' : 'STT'}
              </button>
              
              <button
                onClick={() => {
                  setAiAssistant(!aiAssistant);
                  if (!aiAssistant) generateSmartSuggestions();
                }}
                className={`btn btn-sm ${aiAssistant ? 'btn-primary' : 'btn-outline'}`}
                title="AI Smart Suggestions"
              >
                🤖 AI
              </button>
              
              <button
                onClick={() => setFocusMode(!focusMode)}
                className={`btn btn-sm ${focusMode ? 'btn-primary' : 'btn-outline'}`}
                title="Focus Mode: Hide distractions"
              >
                🧘 Focus
              </button>
              

              
              <button
                onClick={saveContent}
                disabled={saving}
                className="btn btn-success"
              >
                {saving ? (
                  <>
                    <div className="spinner" />
                    Saving...
                  </>
                ) : (
                  <>
                    {user?.role === 'superadmin' ? 'Save' : 'Submit for Approval'}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Collaborators Bar */}
        {collaborators.length > 0 && (
          <div className="card mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <span className="font-medium text-sm">Active Collaborators:</span>
              <div className="collaborator-list">
                {collaborators.map((collab) => (
                  <div 
                    key={collab.socketId} 
                    className={`collaborator-item ${typingUsers.has(collab.socketId) ? 'typing' : ''}`}
                  >
                    <div
                      className={`collaborator-avatar ${typingUsers.has(collab.socketId) ? 'active' : ''}`}
                      style={{ backgroundColor: collab.color }}
                    >
                      {(collab.name || 'U').charAt(0)}
                    </div>
                    <span>{collab.name}</span>
                    {typingUsers.has(collab.socketId) ? (
                      <div className="typing-indicator">
                        <div className="typing-dots">
                          <div className="typing-dot"></div>
                          <div className="typing-dot"></div>
                          <div className="typing-dot"></div>
                        </div>
                      </div>
                    ) : (
                      <div className="status-online"></div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className={`editor-layout ${focusMode ? 'focus-mode-layout' : ''}`}>
          {/* Main Editor Area */}
          <div className="editor-main">
            <div className={`editor-container ${darkMode ? 'dark-theme' : ''} ${focusMode ? 'focus-mode' : ''} ${readingMode ? 'reading-mode' : ''}`}>
              <div className="editor-header">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                    <Edit className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h2 className="font-semibold">Collaborative Editor</h2>
                    <p className="text-gray-600 text-sm">AI-powered real-time collaboration</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-gray-500 text-sm">
                  <span>{wordCount} words</span>
                  <span>{content.length} chars</span>
                  <span>{content.split('\n').length} lines</span>
                  <span>{comments.length} comments</span>
                  {selectedText.text && (
                    <span className="badge badge-success">
                      ✓ Text Selected
                    </span>
                  )}
                  {typingUsers.size > 0 && (
                    <div className="typing-indicator">
                      <div className="typing-dots">
                        <div className="typing-dot"></div>
                        <div className="typing-dot"></div>
                        <div className="typing-dot"></div>
                      </div>
                      <span>{typingUsers.size} typing</span>
                    </div>
                  )}
                 
                </div>
              </div>
              
              <div className="relative">
                <textarea
                  ref={setEditorRef}
                  value={content}
                  onChange={handleContentChange}
                  onSelect={handleEnhancedTextSelection}
                  onMouseUp={handleEnhancedTextSelection}
                  onKeyUp={(e) => {
                    if (socket) {
                      const cursorPosition = e.target.selectionStart;
                      socket.emit('cursor-position', {
                        textPosition: cursorPosition,
                        timestamp: Date.now()
                      });
                    }
                  }}
                  onFocus={() => {
                    if (socket) {
                      socket.emit('user-typing', { isTyping: true });
                    }
                  }}
                  onBlur={() => {
                    if (socket) {
                      socket.emit('user-typing', { isTyping: false });
                    }
                  }}
                  className="editor-textarea"
                  placeholder="🚀 Start typing to collaborate in real-time...\n\n✨ AI Assistant is ready to help\n🎤 Use voice commands\n💬 Select text to add comments\n📊 Track your progress with analytics"
                  spellCheck={false}
                />
                
                {/* Text cursors for other users */}
                {Object.entries(cursors).map(([socketId, cursor]) => {
                  if (cursor.textPosition !== undefined && editorRef && content) {
                    try {
                      const beforeCursor = content.substring(0, cursor.textPosition) || '';
                      const lines = beforeCursor.split('\n');
                      const line = Math.max(0, lines.length - 1);
                      const char = (lines[line] || '').length;
                      
                      return (
                        <div
                          key={`text-${socketId}`}
                          className="notion-cursor"
                          style={{
                            left: char * 8.5 + 16,
                            top: line * 24 + 16,
                            backgroundColor: cursor.user.color
                          }}
                        >
                          <div 
                            className="cursor-flag"
                            style={{ backgroundColor: cursor.user.color }}
                          >
                            {(cursor.user.name || 'U').charAt(0)}
                          </div>
                        </div>
                      );
                    } catch (error) {
                      return null;
                    }
                  }
                  return null;
                })}
                
              
              </div>
            </div>
          </div>

          </div>
          
          {/* Advanced Sidebar */}
          {!focusMode && (
            <div className="editor-sidebar">
              {/* Comments Panel */}
              <div className="card">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  💬 Comments ({comments.length})
                </h3>
                
                <div className="space-y-4 max-h-64 overflow-y-auto">
                  {comments.length === 0 ? (
                    <p className="text-gray-500 text-sm text-center py-4">
                      No comments yet.\nSelect text and add a comment!
                    </p>
                  ) : (
                    comments.map((comment) => (
                      <div key={comment.id} className="comment-item">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold text-white"
                              style={{ backgroundColor: getRandomColor() }}
                            >
                              {(comment.userName || 'U').charAt(0)}
                            </div>
                            <span className="font-medium text-sm">{comment.userName}</span>
                          </div>
                          {(user?.role === 'superadmin' || user?.role === 'admin') && (
                            <button
                              onClick={() => deleteComment(comment.id)}
                              className="text-red-500 hover:text-red-700 text-xs"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                        
                        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-2 mb-2">
                          <p className="text-xs font-mono text-gray-700">
                            "{comment.selectedText}"
                          </p>
                        </div>
                        
                        <p className="text-sm text-gray-800">{comment.text}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(comment.createdAt).toLocaleString()}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
              
              {/* Production-Level Changes Review Panel */}
              {user?.role === 'superadmin' && showChangesPanel && projectChanges.length > 0 && (
                <div className="card">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-semibold flex items-center gap-2">
                      ⚡ Pending Changes ({projectChanges.length})
                    </h3>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          if (confirm(`Approve all ${projectChanges.length} changes?`)) {
                            projectChanges.forEach(change => approveChangeWithFeedback(change.id, 'Bulk approved'));
                          }
                        }}
                        className="btn btn-success btn-sm"
                      >
                        ✅ Approve All
                      </button>
                      <button
                        onClick={() => setShowChangesPanel(false)}
                        className="btn btn-outline btn-sm"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                  
                  <div className="space-y-6 max-h-[600px] overflow-y-auto">
                    {projectChanges.map((change, index) => (
                      <div key={change.id} className="border-2 border-orange-200 rounded-xl p-4 bg-gradient-to-r from-orange-50 to-yellow-50">
                        {/* Change Header */}
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg">
                              {(change.userName || 'U').charAt(0)}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="font-bold text-lg">{change.userName}</h4>
                                <span className="badge badge-warning">Change #{index + 1}</span>
                              </div>
                              <p className="text-sm text-gray-600">
                                📅 {new Date(change.createdAt).toLocaleString()}
                              </p>
                              <div className="flex items-center gap-4 mt-1 text-xs">
                                <span className="text-green-600">+{change.diff?.filter(d => d.type === 'added').length || 0} additions</span>
                                <span className="text-red-600">-{change.diff?.filter(d => d.type === 'removed').length || 0} deletions</span>
                                <span className="text-blue-600">{change.originalContent?.split('\n').length || 0} → {change.proposedContent?.split('\n').length || 0} lines</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                const feedback = prompt('💬 Optional feedback for approval:', 'Looks good!');
                                approveChangeWithFeedback(change.id, feedback);
                              }}
                              className="btn btn-success flex items-center gap-2 shadow-lg hover:shadow-xl transition-all"
                            >
                              <Check className="w-4 h-4" />
                              Approve
                            </button>
                            <button
                              onClick={() => {
                                const feedback = prompt('❌ Reason for rejection (required):', 'Please explain what needs to be changed...');
                                if (feedback && feedback.trim()) {
                                  rejectChangeWithFeedback(change.id, feedback);
                                } else {
                                  alert('Feedback is required for rejection');
                                }
                              }}
                              className="btn btn-danger flex items-center gap-2 shadow-lg hover:shadow-xl transition-all"
                            >
                              <X className="w-4 h-4" />
                              Reject
                            </button>
                          </div>
                        </div>
                        
                        {/* Side-by-Side Diff Comparison */}
                        <div className="bg-white rounded-lg border-2 border-gray-200 overflow-hidden shadow-inner">
                          <div className="bg-gray-100 px-4 py-2 border-b flex items-center justify-between">
                            <h5 className="font-semibold text-gray-700">📝 Content Comparison</h5>
                            <div className="flex gap-2 text-xs">
                              <span className="bg-red-100 text-red-700 px-2 py-1 rounded">Original</span>
                              <span className="bg-green-100 text-green-700 px-2 py-1 rounded">Proposed</span>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 divide-x divide-gray-200 max-h-80 overflow-y-auto">
                            {/* Original Content */}
                            <div className="p-4 bg-red-50">
                              <div className="text-xs font-semibold text-red-700 mb-2 flex items-center gap-1">
                                <span className="w-3 h-3 bg-red-500 rounded-full"></span>
                                ORIGINAL ({change.originalContent?.split('\n').length || 0} lines)
                              </div>
                              <pre className="text-xs font-mono text-gray-800 whitespace-pre-wrap leading-relaxed bg-white p-3 rounded border border-red-200 max-h-64 overflow-y-auto">
                                {change.originalContent || '(empty)'}
                              </pre>
                            </div>
                            
                            {/* Proposed Content */}
                            <div className="p-4 bg-green-50">
                              <div className="text-xs font-semibold text-green-700 mb-2 flex items-center gap-1">
                                <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                                PROPOSED ({change.proposedContent?.split('\n').length || 0} lines)
                              </div>
                              <pre className="text-xs font-mono text-gray-800 whitespace-pre-wrap leading-relaxed bg-white p-3 rounded border border-green-200 max-h-64 overflow-y-auto">
                                {change.proposedContent || '(empty)'}
                              </pre>
                            </div>
                          </div>
                        </div>
                        
                        {/* Detailed Line-by-Line Diff */}
                        {change.diff && change.diff.length > 0 && (
                          <div className="mt-4 bg-white rounded-lg border-2 border-gray-200 overflow-hidden">
                            <div className="bg-gray-100 px-4 py-2 border-b">
                              <h5 className="font-semibold text-gray-700 flex items-center gap-2">
                                🔍 Line-by-Line Changes ({change.diff.length} modifications)
                              </h5>
                            </div>
                            <div className="max-h-60 overflow-y-auto">
                              {change.diff.map((line, idx) => (
                                <div key={idx} className={`flex items-center px-4 py-2 border-b border-gray-100 ${
                                  line.type === 'added' ? 'bg-green-50 border-l-4 border-green-500' :
                                  line.type === 'removed' ? 'bg-red-50 border-l-4 border-red-500' :
                                  'bg-gray-50'
                                }`}>
                                  <div className="flex items-center gap-3 w-full">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                                      line.type === 'added' ? 'bg-green-500 text-white' :
                                      line.type === 'removed' ? 'bg-red-500 text-white' :
                                      'bg-gray-400 text-white'
                                    }`}>
                                      {line.type === 'added' ? '+' : line.type === 'removed' ? '-' : '='}
                                    </div>
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2 mb-1">
                                        <span className="text-xs font-semibold text-gray-500">Line {line.line}</span>
                                        <span className={`text-xs px-2 py-1 rounded ${
                                          line.type === 'added' ? 'bg-green-100 text-green-700' :
                                          line.type === 'removed' ? 'bg-red-100 text-red-700' :
                                          'bg-gray-100 text-gray-700'
                                        }`}>
                                          {line.type === 'added' ? 'ADDED' : line.type === 'removed' ? 'REMOVED' : 'UNCHANGED'}
                                        </span>
                                      </div>
                                      <pre className="text-sm font-mono text-gray-800 whitespace-pre-wrap">
                                        {line.content || '(empty line)'}
                                      </pre>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {/* Change Statistics */}
                        <div className="mt-4 grid grid-cols-3 gap-4">
                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
                            <div className="text-2xl font-bold text-blue-600">{change.originalContent?.length || 0}</div>
                            <div className="text-xs text-blue-700">Original Chars</div>
                          </div>
                          <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
                            <div className="text-2xl font-bold text-green-600">{change.proposedContent?.length || 0}</div>
                            <div className="text-xs text-green-700">Proposed Chars</div>
                          </div>
                          <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 text-center">
                            <div className="text-2xl font-bold text-purple-600">
                              {Math.abs((change.proposedContent?.length || 0) - (change.originalContent?.length || 0))}
                            </div>
                            <div className="text-xs text-purple-700">Net Change</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Review Summary */}
                  <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                    <h4 className="font-semibold text-blue-800 mb-2">📊 Review Summary</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-blue-700">Total Changes:</span>
                        <span className="font-bold ml-2">{projectChanges.length}</span>
                      </div>
                      <div>
                        <span className="text-blue-700">Total Lines Modified:</span>
                        <span className="font-bold ml-2">
                          {projectChanges.reduce((sum, change) => sum + (change.diff?.length || 0), 0)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* AI Smart Suggestions Panel */}
              {aiAssistant && (
                <div className="card">
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    🤖 Smart Suggestions
                  </h3>
                  
                  <div className="space-y-3">
                    <div className="ai-stats bg-gradient-to-r from-blue-50 to-purple-50 p-3 rounded-lg">
                      <div className="text-sm">
                        <div className="flex justify-between mb-2">
                          <span>📝 Readability:</span>
                          <span className="font-medium text-green-600">Good</span>
                        </div>
                        <div className="flex justify-between mb-2">
                          <span>📈 Word Count:</span>
                          <span className="font-medium">{wordCount}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>⏱️ Reading Time:</span>
                          <span className="font-medium">{Math.ceil(wordCount / 200)} min</span>
                        </div>
                      </div>
                    </div>
                    
                    {smartSuggestions.length > 0 ? (
                      <div className="space-y-2">
                        {smartSuggestions.map((suggestion, index) => (
                          <div key={index} className="suggestion-item" data-severity={suggestion.severity}>
                            <div className="flex items-start gap-3">
                              <div className="suggestion-icon">
                                <span className="text-xl">{suggestion.icon}</span>
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <span className={`suggestion-type ${suggestion.severity}`}>
                                    {suggestion.type}
                                  </span>
                                  <span className={`severity-badge ${suggestion.severity}`}>
                                    {suggestion.severity}
                                  </span>
                                </div>
                                <p className="suggestion-text">{suggestion.text}</p>
                                <div className="suggestion-actions">
                                  {suggestion.fix && (
                                    <button 
                                      onClick={() => {
                                        setContent(suggestion.fix);
                                        if (socket) {
                                          socket.emit('content-change', { content: suggestion.fix });
                                        }
                                        generateSmartSuggestions();
                                      }}
                                      className="btn-fix"
                                    >
                                      ✨ Apply Fix
                                    </button>
                                  )}
                                  <button 
                                    onClick={() => setSmartSuggestions(prev => prev.filter((_, i) => i !== index))}
                                    className="btn-dismiss"
                                  >
                                    ✕ Dismiss
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))
                        }
                      </div>
                    ) : (
                      <div className="text-center py-4">
                        <p className="text-gray-500 text-sm">No suggestions yet.</p>
                        <button 
                          onClick={generateSmartSuggestions}
                          className="btn btn-outline btn-sm mt-2"
                        >
                          Generate Suggestions
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              {/* Quick Actions Panel */}
              <div className="card">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  ⚡ Quick Actions
                </h3>
                
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setReadingMode(!readingMode)}
                    className={`btn btn-sm ${readingMode ? 'btn-primary' : 'btn-outline'}`}
                  >
                    📖 Read
                  </button>
                  
                  <button
                    onClick={() => setShowMinimap(!showMinimap)}
                    className={`btn btn-sm ${showMinimap ? 'btn-primary' : 'btn-outline'}`}
                  >
                    🗺️ Map
                  </button>
                  
                  <button
                    onClick={() => {
                      const wordCount = content.trim().split(/\s+/).filter(w => w.length > 0).length;
                      const readingTime = Math.ceil(wordCount / 200);
                      alert(`Document Stats:\n\nWords: ${wordCount}\nCharacters: ${content.length}\nLines: ${content.split('\n').length}\nReading Time: ${readingTime} min`);
                    }}
                    className="btn btn-outline btn-sm"
                  >
                    📊 Stats
                  </button>
                  
                  <button
                    onClick={() => {
                      if (content.trim()) {
                        speakText(content);
                      } else {
                        alert('No content to read');
                      }
                    }}
                    className="btn btn-outline btn-sm"
                  >
                    🔊 Read All
                  </button>
                </div>
                
                <div className="mt-3 pt-3 border-t">
                  <div className="text-xs text-gray-600 space-y-1">
                    <div className="flex justify-between">
                      <span>Last saved:</span>
                      <span>{lastSaved.toLocaleTimeString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>TTS Active:</span>
                      <span className={textToSpeech ? 'text-green-600' : 'text-gray-400'}>
                        {textToSpeech ? 'Yes' : 'No'}
                      </span>
                    </div>
                    {isRecording && (
                      <div className="flex justify-between">
                        <span>Recording:</span>
                        <span className="text-red-600 animate-pulse">• Active</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {/* GitHub-style History Panel */}
              {showHistory && (
                <div className="card">
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    📜 Project History ({history.length})
                  </h3>
                  
                  <div className="space-y-3 max-h-80 overflow-y-auto">
                    {history.length === 0 ? (
                      <p className="text-gray-500 text-sm text-center py-4">
                        No history yet.
                      </p>
                    ) : (
                      history.map((entry, index) => (
                        <div key={entry.id || index} className="history-item border-l-4 pl-3 py-2 border-gray-200">
                          <div className="flex items-start gap-3">
                            <div className="history-icon text-lg">
                              {entry.type === 'commit' ? '📝' : 
                               entry.type === 'pull_request' ? '🔄' :
                               entry.type === 'merge' ? '✅' :
                               entry.type === 'close' ? '❌' : '💬'}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-medium text-sm">{entry.userName}</span>
                                <span className="text-xs text-gray-500">
                                  {new Date(entry.timestamp).toLocaleString()}
                                </span>
                              </div>
                              
                              <div className="text-sm text-gray-700 mb-2">
                                {entry.message}
                              </div>
                              
                              {entry.feedback && (
                                <div className="text-xs bg-blue-50 border border-blue-200 rounded p-2 mb-2">
                                  <strong>Review:</strong> {entry.feedback}
                                </div>
                              )}
                              
                              {/* GitHub-style diff preview */}
                              {entry.diff && entry.diff.length > 0 && (
                                <div className="diff-preview bg-gray-50 border rounded p-2 mt-2 max-h-32 overflow-y-auto">
                                  {entry.diff.slice(0, 5).map((line, idx) => (
                                    <div key={idx} className={`diff-line ${
                                      line.type === 'added' ? 'text-green-700 bg-green-50 border-l-2 border-green-400' :
                                      line.type === 'removed' ? 'text-red-700 bg-red-50 border-l-2 border-red-400' :
                                      'text-gray-600'
                                    } px-2 py-1 text-xs font-mono`}>
                                      <span className="diff-marker font-bold">
                                        {line.type === 'added' ? '+' : line.type === 'removed' ? '-' : ' '}
                                      </span>
                                      <span className="ml-2">{line.content || '(empty line)'}</span>
                                    </div>
                                  ))}
                                  {entry.diff.length > 5 && (
                                    <div className="text-xs text-gray-500 mt-1 text-center">
                                      ... {entry.diff.length - 5} more changes
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  
                  <div className="mt-4 pt-3 border-t">
                    <button
                      onClick={loadHistory}
                      className="btn btn-outline btn-sm w-full"
                    >
                      🔄 Refresh History
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Comment Modal */}
        {showCommentModal && (
          <div className="modal-overlay">
            <div className="modal" style={{maxWidth: '500px'}}>
              <div className="modal-header">
                <h3 className="text-lg font-semibold">Add Comment</h3>
                <button
                  onClick={() => setShowCommentModal(false)}
                  className="btn btn-outline btn-sm !p-2"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              
              <div className="modal-body">
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 mb-4">
                  <p className="text-sm font-medium text-gray-700">Selected text:</p>
                  <p className="text-sm font-mono text-gray-800 mt-1">
                    "{selectedText.text}"
                  </p>
                </div>
                
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="input textarea"
                  placeholder="Add your comment..."
                  rows={4}
                />
              </div>
              
              <div className="modal-footer">
                <button
                  onClick={() => setShowCommentModal(false)}
                  className="btn btn-outline"
                >
                  Cancel
                </button>
                <button
                  onClick={addComment}
                  disabled={!newComment.trim()}
                  className="btn btn-primary"
                >
                  Add Comment
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
  
  );
};

const getRandomColor = () => {
  const colors = [
    '#3b82f6', '#ef4444', '#10b981', '#f59e0b', 
    '#8b5cf6', '#06b6d4', '#f97316', '#84cc16',
    '#ec4899', '#6366f1', '#14b8a6', '#f43f5e'
  ];
  return colors[Math.floor(Math.random() * colors.length)];
};

export default CollaborationApp;