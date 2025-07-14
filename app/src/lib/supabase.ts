import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://your-project.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'your-anon-key'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export interface User {
  id: string
  email: string
  first_name?: string
  last_name?: string
  created_at: string
}

export interface Invitation {
  id: string
  room_id: string
  room_name: string
  inviter_email: string
  inviter_name: string
  invitee_email: string
  invitee_name?: string
  status: 'pending' | 'accepted' | 'rejected'
  created_at: string
  expires_at: string
}

export interface Room {
  id: string
  name: string
  description: string
  created_by: string
  created_at: string
  member_count: number
  is_active: boolean
}

export class SupabaseService {
  static async getAllUsers(): Promise<User[]> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, email, first_name, last_name, created_at')
        .order('created_at', { ascending: false })
      
      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching users:', error)
      return []
    }
  }

  static async getUserByEmail(email: string): Promise<User | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single()
      
      if (error && error.code !== 'PGRST116') throw error
      return data
    } catch (error) {
      console.error('Error fetching user by email:', error)
      return null
    }
  }

  static async getInvitationsForUser(email: string): Promise<Invitation[]> {
    try {
      const { data, error } = await supabase
        .from('invitations')
        .select('*')
        .eq('invitee_email', email)
        .eq('status', 'pending')
        .gt('expires_at', new Date().toISOString())
      
      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching invitations:', error)
      return []
    }
  }

  static async acceptInvitation(invitationId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('invitations')
        .update({ status: 'accepted', updated_at: new Date().toISOString() })
        .eq('id', invitationId)
      
      if (error) throw error
      return true
    } catch (error) {
      console.error('Error accepting invitation:', error)
      return false
    }
  }

  static async rejectInvitation(invitationId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('invitations')
        .update({ status: 'rejected', updated_at: new Date().toISOString() })
        .eq('id', invitationId)
      
      if (error) throw error
      return true
    } catch (error) {
      console.error('Error rejecting invitation:', error)
      return false
    }
  }
}