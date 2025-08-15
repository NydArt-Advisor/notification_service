const { initializeNodemailer, emailConfig } = require('../config/nodemailer');

class NodemailerService {
  constructor() {
    this.transporter = initializeNodemailer();
    this.isInitialized = !!this.transporter;
  }

  async sendPasswordResetEmail(email, resetToken) {
    if (!this.isInitialized) {
      console.warn('Nodemailer not initialized. Email sending disabled.');
      return {
        success: false,
        message: 'Email service not configured',
        error: 'EMAIL_USER or EMAIL_PASSWORD not found'
      };
    }

    try {
      // Create reset link
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      const resetLink = `${frontendUrl}/auth/reset-password?token=${resetToken}`;

      const mailOptions = {
        from: `"${emailConfig.fromName}" <${emailConfig.from}>`,
        to: email,
        subject: emailConfig.resetPasswordTemplate.subject,
        html: emailConfig.resetPasswordTemplate.html(resetLink),
        text: emailConfig.resetPasswordTemplate.text(resetLink)
      };

      console.log(`Sending password reset email to: ${email}`);
      console.log(`Reset link: ${resetLink}`);

      const info = await this.transporter.sendMail(mailOptions);
      
      console.log('Email sent successfully:', {
        messageId: info.messageId,
        response: info.response
      });

      return {
        success: true,
        message: 'Password reset email sent successfully',
        data: {
          email,
          sentAt: new Date().toISOString(),
          messageId: info.messageId
        }
      };

    } catch (error) {
      console.error('Error sending password reset email:', error);
      
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
        message: 'Nodemailer not initialized',
        error: 'EMAIL_USER or EMAIL_PASSWORD not found'
      };
    }

    try {
      // Verify connection configuration
      await this.transporter.verify();
      
      return {
        success: true,
        message: 'Nodemailer connection test successful'
      };
    } catch (error) {
      console.error('Nodemailer connection test failed:', error);
      return {
        success: false,
        message: 'Nodemailer connection test failed',
        error: error.message
      };
    }
  }

  // Send test email
  async sendTestEmail() {
    if (!this.isInitialized) {
      return {
        success: false,
        message: 'Nodemailer not initialized',
        error: 'EMAIL_USER or EMAIL_PASSWORD not found'
      };
    }

    try {
      const testEmail = process.env.TEST_EMAIL || 'test@example.com';
      
      const mailOptions = {
        from: `"${emailConfig.fromName}" <${emailConfig.from}>`,
        to: testEmail,
        subject: 'Test Email - NydArt Advisor',
        text: 'This is a test email to verify Nodemailer configuration.',
        html: '<p>This is a test email to verify Nodemailer configuration.</p>'
      };

      const info = await this.transporter.sendMail(mailOptions);
      
      return {
        success: true,
        message: 'Test email sent successfully',
        data: {
          messageId: info.messageId,
          to: testEmail
        }
      };
    } catch (error) {
      console.error('Test email failed:', error);
      return {
        success: false,
        message: 'Test email failed',
        error: error.message
      };
    }
  }
}

module.exports = new NodemailerService(); 