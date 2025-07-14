import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { Check, X, Users, Calendar, Mail } from 'lucide-react'
import { SupabaseService, Invitation } from '../../lib/supabase'

export default function InvitePage() {
  const router = useRouter()
  const { id } = router.query
  const [invitation, setInvitation] = useState<Invitation | null>(null)
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [status, setStatus] = useState<'pending' | 'accepted' | 'rejected' | 'expired'>('pending')

  useEffect(() => {
    if (id) {
      loadInvitation()
    }
  }, [id])

  const loadInvitation = async () => {
    try {
      setLoading(true)
      const mockInvitation: Invitation = {
        id: id as string,
        room_id: 'room_123',
        room_name: 'Design Review Session',
        inviter_email: 'admin@company.com',
        inviter_name: 'John Admin',
        invitee_email: 'user@example.com',
        invitee_name: 'Jane User',
        status: 'pending',
        created_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      }
      
      setInvitation(mockInvitation)
      
      if (new Date(mockInvitation.expires_at) < new Date()) {
        setStatus('expired')
      } else {
        setStatus(mockInvitation.status as any)
      }
    } catch (error) {
      console.error('Failed to load invitation:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAccept = async () => {
    if (!invitation) return
    
    try {
      setProcessing(true)
      const success = await SupabaseService.acceptInvitation(invitation.id)
      
      if (success) {
        setStatus('accepted')
        setTimeout(() => {
          router.push(`/room/${invitation.room_id}`)
        }, 2000)
      } else {
        alert('Failed to accept invitation')
      }
    } catch (error) {
      console.error('Error accepting invitation:', error)
      alert('Failed to accept invitation')
    } finally {
      setProcessing(false)
    }
  }

  const handleReject = async () => {
    if (!invitation) return
    
    try {
      setProcessing(true)
      const success = await SupabaseService.rejectInvitation(invitation.id)
      
      if (success) {
        setStatus('rejected')
      } else {
        alert('Failed to reject invitation')
      }
    } catch (error) {
      console.error('Error rejecting invitation:', error)
      alert('Failed to reject invitation')
    } finally {
      setProcessing(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!invitation) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <X className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Invitation Not Found</h1>
          <p className="text-gray-600 mb-6">
            This invitation link is invalid or has been removed.
          </p>
          <button
            onClick={() => router.push('/')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg"
          >
            Go Home
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-lg w-full bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-6 text-white">
          <div className="flex items-center space-x-3 mb-2">
            <Users className="w-8 h-8" />
            <h1 className="text-2xl font-bold">Collaboration Invitation</h1>
          </div>
          <p className="text-blue-100">You've been invited to join a real-time collaboration room</p>
        </div>

        <div className="px-8 py-6">
          {status === 'pending' && (
            <>
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  Join "{invitation.room_name}"
                </h2>
                <p className="text-gray-600">
                  <strong>{invitation.inviter_name}</strong> has invited you to collaborate on this project.
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="grid grid-cols-1 gap-3">
                  <div className="flex items-center space-x-3">
                    <Mail className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">From</p>
                      <p className="text-sm text-gray-600">{invitation.inviter_name} ({invitation.inviter_email})</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Calendar className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Expires</p>
                      <p className="text-sm text-gray-600">
                        {new Date(invitation.expires_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-3">What you can do:</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center space-x-2">
                    <Check className="w-4 h-4 text-green-500" />
                    <span>Real-time collaboration with live cursors</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <Check className="w-4 h-4 text-green-500" />
                    <span>See who's online and active</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <Check className="w-4 h-4 text-green-500" />
                    <span>Instant content synchronization</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <Check className="w-4 h-4 text-green-500" />
                    <span>Comment and discuss in real-time</span>
                  </li>
                </ul>
              </div>

              <div className="flex space-x-4">
                <button
                  onClick={handleAccept}
                  disabled={processing}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  <Check className="w-5 h-5" />
                  <span>{processing ? 'Accepting...' : 'Accept Invitation'}</span>
                </button>
                <button
                  onClick={handleReject}
                  disabled={processing}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  <X className="w-5 h-5" />
                  <span>{processing ? 'Rejecting...' : 'Decline'}</span>
                </button>
              </div>
            </>
          )}

          {status === 'accepted' && (
            <div className="text-center">
              <Check className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Invitation Accepted!</h2>
              <p className="text-gray-600 mb-6">
                Welcome to the collaboration room. You'll be redirected shortly...
              </p>
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            </div>
          )}

          {status === 'rejected' && (
            <div className="text-center">
              <X className="w-16 h-16 text-gray-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Invitation Declined</h2>
              <p className="text-gray-600 mb-6">
                You have declined this collaboration invitation.
              </p>
              <button
                onClick={() => router.push('/')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg"
              >
                Go Home
              </button>
            </div>
          )}

          {status === 'expired' && (
            <div className="text-center">
              <Calendar className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Invitation Expired</h2>
              <p className="text-gray-600 mb-6">
                This invitation has expired. Please ask for a new invitation.
              </p>
              <button
                onClick={() => router.push('/')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg"
              >
                Go Home
              </button>
            </div>
          )}
        </div>

        <div className="bg-gray-50 px-8 py-4 text-center">
          <p className="text-sm text-gray-500">
            Powered by <strong>CollabFlow</strong> - Real-time Collaboration Made Simple
          </p>
        </div>
      </div>
    </div>
  )
}