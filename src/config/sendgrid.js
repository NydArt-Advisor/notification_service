const sgMail = require('@sendgrid/mail');

// Initialize SendGrid with API key
const initializeSendGrid = () => {
  const apiKey = process.env.SENDGRID_API_KEY;
  
  if (!apiKey) {
    console.warn('SENDGRID_API_KEY not found in environment variables. Email sending will be disabled.');
    return false;
  }
  
  sgMail.setApiKey(apiKey);
  console.log('SendGrid initialized successfully');
  return true;
};

// Email configuration
const emailConfig = {
  from: process.env.SENDGRID_FROM_EMAIL || 'noreply@nydart-advisor.com',
  fromName: process.env.SENDGRID_FROM_NAME || 'NydArt Advisor',
  resetPasswordTemplate: {
    subject: 'Reset Your Password - NydArt Advisor',
    html: (resetLink) => `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reset Your Password</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
          .warning { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>NydArt Advisor</h1>
            <p>Password Reset Request</p>
          </div>
          <div class="content">
            <h2>Hello!</h2>
            <p>We received a request to reset your password for your NydArt Advisor account.</p>
            
            <div style="text-align: center;">
              <a href="${resetLink}" class="button">Reset Password</a>
            </div>
            
            <div class="warning">
              <strong>Important:</strong> This link will expire in 1 hour for security reasons.
            </div>
            
            <p>If you didn't request this password reset, you can safely ignore this email. Your password will remain unchanged.</p>
            
            <p>If you're having trouble clicking the button, copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #667eea;">${resetLink}</p>
          </div>
          <div class="footer">
            <p>This email was sent from NydArt Advisor. Please do not reply to this email.</p>
            <p>If you have any questions, please contact our support team.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: (resetLink) => `
      Reset Your Password - NydArt Advisor
      
      Hello!
      
      We received a request to reset your password for your NydArt Advisor account.
      
      Click the following link to reset your password:
      ${resetLink}
      
      Important: This link will expire in 1 hour for security reasons.
      
      If you didn't request this password reset, you can safely ignore this email. Your password will remain unchanged.
      
      If you're having trouble clicking the link, copy and paste it into your browser.
      
      This email was sent from NydArt Advisor. Please do not reply to this email.
      If you have any questions, please contact our support team.
    `
  }
};

module.exports = {
  sgMail,
  initializeSendGrid,
  emailConfig
}; 