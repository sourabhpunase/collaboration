import { useState, useEffect } from 'react'
import { Users, Plus, Eye, Settings, Trash2, Send, Copy, ExternalLink } from 'lucide-react'

interface Room {
  id: string
  name: string
  description: string
  memberCount: number
  isActive: boolean
  createdAt: string
  lastActivity: string
}

interface RoomManagerProps {
  apiKey: string
  baseUrl: string
}

export default function RoomManager({ apiKey, baseUrl }: RoomManagerProps) {
  const [rooms, setRooms] = useState<Room[]>([])
  const [loading, setLoading] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null)
  const [newRoom, setNewRoom] = useState({ name: '', description: '' })
  const [inviteEmails, setInviteEmails] = useState('')

  useEffect(() => {
    loadRooms()
  }, [])

  const apiCall = async (endpoint: string, options: RequestInit = {}) => {
    const response = await fetch(`${baseUrl}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
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

  const loadRooms = async () => {
    try {
      setLoading(true)
      const result = await apiCall('/rooms')
      setRooms(result.rooms || [])
    } catch (error) {
      console.error('Failed to load rooms:', error)
    } finally {
      setLoading(false)
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
    if (!selectedRoom || !inviteEmails.trim()) return
    
    const emails = inviteEmails.split(',').map(email => email.trim()).filter(Boolean)
    
    try {
      setLoading(true)
      await apiCall(`/rooms/${selectedRoom.id}/invite`, {
        method: 'POST',
        body: JSON.stringify({ emails }),
      })
      
      alert(`Invitations sent to ${emails.length} users!`)
      setInviteEmails('')
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

  const openRoom = (roomId: string) => {
    window.open(`/room/${roomId}`, '_blank')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Collaboration Rooms</h2>
          <p className="text-gray-600">Manage your real-time collaboration spaces</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>New Room</span>
        </button>
      </div>

      {/* Rooms Grid */}
      {loading && rooms.length === 0 ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading rooms...</p>
        </div>
      ) : rooms.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border-2 border-dashed border-gray-300">
          <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No rooms yet</h3>
          <p className="text-gray-600 mb-4">Create your first collaboration room to get started</p>
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
                    <button
                      onClick={() => openRoom(room.id)}
                      className="p-1 text-gray-400 hover:text-gray-600"
                      title="Open room"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                  <div className="flex items-center space-x-1">
                    <Users className="w-4 h-4" />
                    <span>{room.memberCount} users</span>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    room.isActive 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {room.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                
                <div className="text-xs text-gray-500 mb-4">
                  Created: {new Date(room.createdAt).toLocaleDateString()}
                  <br />
                  Last activity: {new Date(room.lastActivity).toLocaleString()}
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
                  <button
                    onClick={() => openRoom(room.id)}
                    className="flex-1 bg-green-50 hover:bg-green-100 text-green-700 px-3 py-2 rounded text-sm flex items-center justify-center space-x-1"
                  >
                    <Eye className="w-3 h-3" />
                    <span>View</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

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
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Addresses (comma-separated)
                </label>
                <textarea
                  value={inviteEmails}
                  onChange={(e) => setInviteEmails(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={4}
                  placeholder="user1@example.com, user2@example.com"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowInviteModal(false)
                  setSelectedRoom(null)
                  setInviteEmails('')
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={inviteUsers}
                disabled={loading || !inviteEmails.trim()}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md disabled:opacity-50"
              >
                {loading ? 'Sending...' : 'Send Invitations'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}