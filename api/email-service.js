const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    // Configure your email service (Gmail, SendGrid, etc.)
    this.transporter = nodemailer.createTransporter({
      service: 'gmail', // or your email service
      auth: {
        user: process.env.EMAIL_USER || 'your-email@gmail.com',
        pass: process.env.EMAIL_PASS || 'your-app-password'
      }
    });
  }

  async sendInvitationEmail(invitation) {
    const inviteUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/invite/${invitation.id}`;
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🚀 CollabFlow Invitation</h1>
            <p>You've been invited to collaborate!</p>
          </div>
          <div class="content">
            <h2>Hi ${invitation.invitee_name || invitation.invitee_email}!</h2>
            <p><strong>${invitation.inviter_name}</strong> has invited you to collaborate on:</p>
            <h3>📋 ${invitation.room_name}</h3>
            <p>Join this real-time collaboration room to work together with your team.</p>
            <a href="${inviteUrl}" class="button">Accept Invitation</a>
            <p><strong>What you can do:</strong></p>
            <ul>
              <li>✨ Real-time collaboration</li>
              <li>👥 See live cursors and presence</li>
              <li>💬 Comment and discuss</li>
              <li>🔄 Sync content instantly</li>
            </ul>
            <p><small>This invitation expires in 7 days.</small></p>
          </div>
          <div class="footer">
            <p>Powered by CollabFlow - Real-time Collaboration Made Simple</p>
            <p>If you didn't expect this invitation, you can safely ignore this email.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const mailOptions = {
      from: `"CollabFlow" <${process.env.EMAIL_USER || 'noreply@collabflow.dev'}>`,
      to: invitation.invitee_email,
      subject: `🚀 You're invited to collaborate on "${invitation.room_name}"`,
      html: htmlContent,
      text: `
        Hi ${invitation.invitee_name || invitation.invitee_email}!
        
        ${invitation.inviter_name} has invited you to collaborate on "${invitation.room_name}".
        
        Click here to accept: ${inviteUrl}
        
        This invitation expires in 7 days.
        
        Powered by CollabFlow
      `
    };

    try {
      const result = await this.transporter.sendMail(mailOptions);
      console.log('Invitation email sent:', result.messageId);
      return { success: true, messageId: result.messageId };
    } catch (error) {
      console.error('Failed to send invitation email:', error);
      return { success: false, error: error.message };
    }
  }

  async sendWelcomeEmail(user) {
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Welcome to CollabFlow!</h1>
          </div>
          <div class="content">
            <h2>Hi ${user.first_name || user.email}!</h2>
            <p>Welcome to CollabFlow - the easiest way to add real-time collaboration to any project.</p>
            <p><strong>What's next?</strong></p>
            <ul>
              <li>🏠 Visit your dashboard to manage rooms</li>
              <li>🔑 Get your API keys to integrate</li>
              <li>👥 Invite team members to collaborate</li>
              <li>🚀 Start building amazing collaborative experiences</li>
            </ul>
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard" class="button">Go to Dashboard</a>
          </div>
        </div>
      </body>
      </html>
    `;

    const mailOptions = {
      from: `"CollabFlow" <${process.env.EMAIL_USER || 'noreply@collabflow.dev'}>`,
      to: user.email,
      subject: '🎉 Welcome to CollabFlow!',
      html: htmlContent
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log('Welcome email sent to:', user.email);
    } catch (error) {
      console.error('Failed to send welcome email:', error);
    }
  }
}

module.exports = EmailService;