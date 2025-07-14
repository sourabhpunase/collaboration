const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'your-anon-key';

const supabase = createClient(supabaseUrl, supabaseKey);

class SupabaseService {
  constructor() {
    this.supabase = supabase;
  }

  // Get all users from Supabase
  async getAllUsers() {
    try {
      const { data, error } = await this.supabase
        .from('users')
        .select('id, email, first_name, last_name, created_at')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching users:', error);
      return [];
    }
  }

  // Get user by email
  async getUserByEmail(email) {
    try {
      const { data, error } = await this.supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data;
    } catch (error) {
      console.error('Error fetching user by email:', error);
      return null;
    }
  }

  // Create invitation record
  async createInvitation(invitationData) {
    try {
      const { data, error } = await this.supabase
        .from('invitations')
        .insert([{
          room_id: invitationData.roomId,
          room_name: invitationData.roomName,
          inviter_email: invitationData.inviterEmail,
          inviter_name: invitationData.inviterName,
          invitee_email: invitationData.inviteeEmail,
          invitee_name: invitationData.inviteeName,
          status: 'pending',
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating invitation:', error);
      throw error;
    }
  }

  // Get invitations for user
  async getInvitationsForUser(email) {
    try {
      const { data, error } = await this.supabase
        .from('invitations')
        .select('*')
        .eq('invitee_email', email)
        .eq('status', 'pending')
        .gt('expires_at', new Date().toISOString());
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching invitations:', error);
      return [];
    }
  }

  // Update invitation status
  async updateInvitationStatus(invitationId, status) {
    try {
      const { data, error } = await this.supabase
        .from('invitations')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', invitationId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating invitation:', error);
      throw error;
    }
  }

  // Create room membership
  async createRoomMembership(roomId, userId, email) {
    try {
      const { data, error } = await this.supabase
        .from('room_members')
        .insert([{
          room_id: roomId,
          user_id: userId,
          user_email: email,
          role: 'member',
          joined_at: new Date().toISOString()
        }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating room membership:', error);
      throw error;
    }
  }

  // Get room members
  async getRoomMembers(roomId) {
    try {
      const { data, error } = await this.supabase
        .from('room_members')
        .select(`
          *,
          users:user_id (
            id,
            email,
            first_name,
            last_name
          )
        `)
        .eq('room_id', roomId);
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching room members:', error);
      return [];
    }
  }
}

module.exports = SupabaseService;