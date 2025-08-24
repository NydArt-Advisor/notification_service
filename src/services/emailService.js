const { sgMail, initializeSendGrid, emailConfig } = require('../config/sendgrid');

class EmailService {
  constructor() {
    this.isInitialized = initializeSendGrid();
  }

  async sendPasswordResetEmail(email, resetToken) {
    if (!this.isInitialized) {
      console.warn('SendGrid not initialized. Email sending disabled.');
      return {
        success: false,
        message: 'Email service not configured',
        error: 'SENDGRID_API_KEY not found'
      };
    }

    try {
      // Create reset link (you'll need to update this with your frontend URL)
      const frontendUrl = process.env.FRONTEND_URL;
      const resetLink = `${frontendUrl}/auth/reset-password?token=${resetToken}`;

      const msg = {
        to: email,
        from: {
          email: emailConfig.from,
          name: emailConfig.fromName
        },
        subject: emailConfig.resetPasswordTemplate.subject,
        html: emailConfig.resetPasswordTemplate.html(resetLink),
        text: emailConfig.resetPasswordTemplate.text(resetLink)
      };

      console.log(`Sending password reset email to: ${email}`);
      console.log(`Reset link: ${resetLink}`);

      const response = await sgMail.send(msg);
      
      console.log('Email sent successfully:', {
        statusCode: response[0].statusCode,
        headers: response[0].headers
      });

      return {
        success: true,
        message: 'Password reset email sent successfully',
        data: {
          email,
          sentAt: new Date().toISOString(),
          messageId: response[0].headers['x-message-id']
        }
      };

    } catch (error) {
      console.error('Error sending password reset email:', error);
      
      // Handle specific SendGrid errors
      if (error.response) {
        const { body } = error.response;
        console.error('SendGrid API Error:', body);
        
        return {
          success: false,
          message: 'Failed to send password reset email',
          error: body.errors ? body.errors[0].message : 'SendGrid API error',
          details: body
        };
      }

      return {
        success: false,
        message: 'Failed to send password reset email',
        error: error.message
      };
    }
  }

  // Test email service
  async testConnection() {
    if (!this.isInitialized) {
      return {
        success: false,
        message: 'SendGrid not initialized',
        error: 'SENDGRID_API_KEY not found'
      };
    }

    try {
      // Send a test email to verify configuration
      const testMsg = {
        to: 'test@example.com',
        from: emailConfig.from,
        subject: 'Test Email - NydArt Advisor',
        text: 'This is a test email to verify SendGrid configuration.',
        html: '<p>This is a test email to verify SendGrid configuration.</p>'
      };

      await sgMail.send(testMsg);
      
      return {
        success: true,
        message: 'SendGrid connection test successful'
      };
    } catch (error) {
      console.error('SendGrid connection test failed:', error);
      return {
        success: false,
        message: 'SendGrid connection test failed',
        error: error.message
      };
    }
  }
}

module.exports = new EmailService(); 