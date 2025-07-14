import React, { useEffect, useRef, useState } from 'react'
import { useCollabFlow } from '../index'

interface CollabRoomProps {
  roomId: string
  className?: string
  showCursors?: boolean
  showUsers?: boolean
}

interface CursorPosition {
  x: number
  y: number
  user: {
    id: string
    name: string
    color: string
  }
}

export const CollabRoom: React.FC<CollabRoomProps> = ({
  roomId,
  className = '',
  showCursors = true,
  showUsers = true
}) => {
  const { 
    joinRoom, 
    leaveRoom, 
    cursors, 
    onlineUsers, 
    trackCursor, 
    content, 
    updateContent,
    isConnected,
    currentRoom 
  } = useCollabFlow()
  
  const containerRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [localContent, setLocalContent] = useState('')

  useEffect(() => {
    if (roomId) {
      joinRoom(roomId)
    }
    
    return () => {
      if (roomId) {
        leaveRoom(roomId)
      }
    }
  }, [roomId])

  useEffect(() => {
    setLocalContent(content)
  }, [content])

  const handleMouseMove = (e: React.MouseEvent) => {
    if (showCursors && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      trackCursor(x, y)
    }
  }

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value
    setLocalContent(newContent)
    updateContent(newContent)
  }

  const renderCursors = () => {
    if (!showCursors) return null
    
    return Array.from(cursors.entries()).map(([userId, cursor]) => (
      <div
        key={userId}
        className="absolute pointer-events-none z-10"
        style={{
          left: cursor.x,
          top: cursor.y,
          transform: 'translate(-50%, -50%)'
        }}
      >
        <div
          className="w-4 h-4 rounded-full border-2 border-white shadow-lg"
          style={{ backgroundColor: cursor.user.color }}
        />
        <div
          className="absolute top-5 left-0 px-2 py-1 text-xs text-white rounded shadow-lg whitespace-nowrap"
          style={{ backgroundColor: cursor.user.color }}
        >
          {cursor.user.name}
        </div>
      </div>
    ))
  }

  const renderUserList = () => {
    if (!showUsers || onlineUsers.length === 0) return null
    
    return (
      <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-3 z-20">
        <h4 className="text-sm font-medium text-gray-900 mb-2">
          Online ({onlineUsers.length})
        </h4>
        <div className="space-y-1">
          {onlineUsers.map((userId) => (
            <div key={userId} className="flex items-center space-x-2 text-sm">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-gray-700">{userId}</span>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div 
      ref={containerRef}
      className={`relative w-full h-full ${className}`}
      onMouseMove={handleMouseMove}
    >
      {/* Connection Status */}
      <div className="absolute top-4 left-4 z-20">
        <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm ${
          isConnected 
            ? 'bg-green-100 text-green-800' 
            : 'bg-red-100 text-red-800'
        }`}>
          <div className={`w-2 h-2 rounded-full ${
            isConnected ? 'bg-green-500' : 'bg-red-500'
          }`}></div>
          <span>{isConnected ? 'Connected' : 'Disconnected'}</span>
        </div>
      </div>

      {/* Room Info */}
      {currentRoom && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-20">
          <div className="bg-white rounded-lg shadow-lg px-4 py-2">
            <h3 className="text-sm font-medium text-gray-900">{currentRoom.name}</h3>
            <p className="text-xs text-gray-500">{currentRoom.description}</p>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <textarea
        ref={textareaRef}
        value={localContent}
        onChange={handleContentChange}
        className="w-full h-full p-6 border-0 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg"
        placeholder="Start collaborating... Your changes will be visible to others in real-time!"
        style={{ minHeight: '400px' }}
      />

      {/* Live Cursors */}
      {renderCursors()}

      {/* Online Users */}
      {renderUserList()}
    </div>
  )
}

export default CollabRoom