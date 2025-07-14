import { useState, useEffect } from 'react'
import { Users, Zap, Eye, Plus, Settings, Key, Webhook, BarChart3, Send, Copy, ExternalLink } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { SupabaseService, User } from '../lib/supabase'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'
const DEMO_API_KEY = 'pk_live_demo123456789'

interface Room {
  id: string
  name: string
  description: string
  memberCount: number
  isActive: boolean
  createdAt: string
  lastActivity: string
}

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('overview')
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(false)
  const [rooms, setRooms] = useState<Room[]>([])
  const [availableUsers, setAvailableUsers] = useState<User[]>([])
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null)
  const [newRoom, setNewRoom] = useState({ name: '', description: '' })
  const [selectedUserEmails, setSelectedUserEmails] = useState<string[]>([])

  useEffect(() => {
    loadAnalytics()
    loadRooms()
    loadAvailableUsers()
  }, [])

  const apiCall = async (endpoint: string, options: RequestInit = {}) => {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEMO_API_KEY}`,
        ...options.headers,
      },
      ...options,
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'API call failed')
    }
    
    return response.json()
  }

  const loadAnalytics = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${API_BASE_URL}/analytics`, {
        headers: { 'Authorization': `Bearer ${DEMO_API_KEY}` }
      })
      const result = await response.json()
      if (result.success) {
        setAnalytics(result.analytics)
      }
    } catch (error) {
      console.error('Failed to load analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadRooms = async () => {
    try {
      const result = await apiCall('/rooms')
      setRooms(result.rooms || [])
    } catch (error) {
      console.error('Failed to load rooms:', error)
    }
  }

  const loadAvailableUsers = async () => {
    try {
      const users = await SupabaseService.getAllUsers()
      setAvailableUsers(users)
    } catch (error) {
      console.error('Failed to load users:', error)
    }
  }

  const createRoom = async () => {
    if (!newRoom.name.trim()) return
    
    try {
      setLoading(true)
      const result = await apiCall('/rooms', {
        method: 'POST',
        body: JSON.stringify(newRoom),
      })
      
      setRooms(prev => [...prev, result.room])
      setNewRoom({ name: '', description: '' })
      setShowCreateModal(false)
    } catch (error) {
      alert('Failed to create room: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const inviteUsers = async () => {
    if (!selectedRoom || selectedUserEmails.length === 0) return
    
    try {
      setLoading(true)
      await apiCall(`/rooms/${selectedRoom.id}/invite`, {
        method: 'POST',
        body: JSON.stringify({ emails: selectedUserEmails }),
      })
      
      alert(`Invitations sent to ${selectedUserEmails.length} users!`)
      setSelectedUserEmails([])
      setShowInviteModal(false)
      setSelectedRoom(null)
    } catch (error) {
      alert('Failed to send invitations: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const copyRoomUrl = (roomId: string) => {
    const url = `${window.location.origin}/room/${roomId}`
    navigator.clipboard.writeText(url)
    alert('Room URL copied to clipboard!')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">CollabFlow Dashboard</h1>
                <p className="text-sm text-gray-500">Manage your real-time collaboration</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setActiveTab('rooms')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>New Room</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'overview', name: 'Overview', icon: BarChart3 },
              { id: 'rooms', name: 'Rooms', icon: Users },
              { id: 'api-keys', name: 'API Keys', icon: Key },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.name}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <Users className="h-8 w-8 text-blue-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Active Users</p>
                    <p className="text-3xl font-bold text-gray-900">{analytics?.uniqueUsers || 0}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <Zap className="h-8 w-8 text-green-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Active Rooms</p>
                    <p className="text-3xl font-bold text-gray-900">{rooms.filter(r => r.isActive).length}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <Eye className="h-8 w-8 text-purple-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Total Rooms</p>
                    <p className="text-3xl font-bold text-gray-900">{rooms.length}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <Users className="h-8 w-8 text-orange-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Available Users</p>
                    <p className="text-3xl font-bold text-gray-900">{availableUsers.length}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Rooms Tab */}
        {activeTab === 'rooms' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Collaboration Rooms</h2>
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Create Room</span>
              </button>
            </div>

            {rooms.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg border-2 border-dashed border-gray-300">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No rooms yet</h3>
                <p className="text-gray-600 mb-4">Create your first collaboration room</p>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
                >
                  Create Room
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {rooms.map((room) => (
                  <div key={room.id} className="bg-white rounded-lg shadow border hover:shadow-lg transition-shadow">
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center space-x-3">
                          <div className={`w-3 h-3 rounded-full ${room.isActive ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                          <div>
                            <h3 className="font-semibold text-gray-900">{room.name}</h3>
                            <p className="text-sm text-gray-500">{room.description}</p>
                          </div>
                        </div>
                        <div className="flex space-x-1">
                          <button
                            onClick={() => copyRoomUrl(room.id)}
                            className="p-1 text-gray-400 hover:text-gray-600"
                            title="Copy room URL"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                        <div className="flex items-center space-x-1">
                          <Users className="w-4 h-4" />
                          <span>{room.memberCount} users</span>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          room.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {room.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            setSelectedRoom(room)
                            setShowInviteModal(true)
                          }}
                          className="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-700 px-3 py-2 rounded text-sm flex items-center justify-center space-x-1"
                        >
                          <Send className="w-3 h-3" />
                          <span>Invite</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* API Keys Tab */}
        {activeTab === 'api-keys' && (
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">API Keys</h3>
            <div className="space-y-4">
              <div className="border rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-medium">Publishable Key</h4>
                    <p className="text-sm text-gray-500">Use this in your frontend code</p>
                    <code className="text-sm bg-gray-100 px-2 py-1 rounded mt-2 block">
                      {DEMO_API_KEY}
                    </code>
                  </div>
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(DEMO_API_KEY)
                      alert('API key copied!')
                    }}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    Copy
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Create Room Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Create New Room</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Room Name</label>
                <input
                  type="text"
                  value={newRoom.name}
                  onChange={(e) => setNewRoom({ ...newRoom, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Design Review"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={newRoom.description}
                  onChange={(e) => setNewRoom({ ...newRoom, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Collaborative design review session"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={createRoom}
                disabled={loading || !newRoom.name.trim()}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md disabled:opacity-50"
              >
                {loading ? 'Creating...' : 'Create Room'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Invite Modal */}
      {showInviteModal && selectedRoom && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Invite Users to {selectedRoom.name}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Users from Database ({availableUsers.length} available)
                </label>
                <div className="max-h-60 overflow-y-auto border border-gray-300 rounded-md">
                  {availableUsers.map((user) => (
                    <label key={user.id} className="flex items-center p-3 hover:bg-gray-50 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedUserEmails.includes(user.email)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedUserEmails([...selectedUserEmails, user.email])
                          } else {
                            setSelectedUserEmails(selectedUserEmails.filter(email => email !== user.email))
                          }
                        }}
                        className="mr-3"
                      />
                      <div>
                        <div className="font-medium text-gray-900">
                          {user.first_name && user.last_name 
                            ? `${user.first_name} ${user.last_name}` 
                            : user.email
                          }
                        </div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </label>
                  ))}
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  {selectedUserEmails.length} user(s) selected
                </p>
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowInviteModal(false)
                  setSelectedRoom(null)
                  setSelectedUserEmails([])
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={inviteUsers}
                disabled={loading || selectedUserEmails.length === 0}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md disabled:opacity-50"
              >
                {loading ? 'Sending...' : `Send ${selectedUserEmails.length} Invitations`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}