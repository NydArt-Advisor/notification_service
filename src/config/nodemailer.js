const nodemailer = require('nodemailer');

// Initialize Nodemailer with configuration
const initializeNodemailer = () => {
  const emailProvider = process.env.EMAIL_PROVIDER || 'gmail';
  const emailUser = process.env.EMAIL_USER;
  const emailPassword = process.env.EMAIL_PASSWORD;
  const emailHost = process.env.EMAIL_HOST;
  const emailPort = process.env.EMAIL_PORT || 587;
  const emailSecure = process.env.EMAIL_SECURE === 'true';

  if (!emailUser || !emailPassword) {
    console.warn('EMAIL_USER or EMAIL_PASSWORD not found. Email sending will be disabled.');
    return null;
  }

  let transporter;

  switch (emailProvider.toLowerCase()) {
    case 'gmail':
      transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: emailUser,
          pass: emailPassword // Use App Password for Gmail
        },
        tls: {
          rejectUnauthorized: false
        }
      });
      break;

    case 'outlook':
    case 'hotmail':
      transporter = nodemailer.createTransport({
        service: 'outlook',
        auth: {
          user: emailUser,
          pass: emailPassword
        }
      });
      break;

    case 'yahoo':
      transporter = nodemailer.createTransport({
        service: 'yahoo',
        auth: {
          user: emailUser,
          pass: emailPassword
        }
      });
      break;

    case 'custom':
      if (!emailHost) {
        console.error('EMAIL_HOST required for custom email provider');
        return null;
      }
      transporter = nodemailer.createTransport({
        host: emailHost,
        port: emailPort,
        secure: emailSecure,
        auth: {
          user: emailUser,
          pass: emailPassword
        }
      });
      break;

    default:
      console.error(`Unsupported email provider: ${emailProvider}`);
      return null;
  }

  console.log(`Nodemailer initialized with ${emailProvider}`);
  return transporter;
};

// Email configuration
const emailConfig = {
  from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
  fromName: process.env.EMAIL_FROM_NAME || 'NydArt Advisor',
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
  },
  welcomeTemplate: {
    subject: 'Welcome to NydArt Advisor! 🎨',
    html: (username, loginLink) => `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to NydArt Advisor</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px; text-align: center; border-radius: 15px 15px 0 0; }
          .content { background: #f9f9f9; padding: 40px; border-radius: 0 0 15px 15px; }
          .button { display: inline-block; background: #667eea; color: white; padding: 15px 35px; text-decoration: none; border-radius: 8px; margin: 25px 0; font-weight: bold; font-size: 16px; }
          .footer { text-align: center; margin-top: 40px; color: #666; font-size: 14px; }
          .highlight { background: #e8f4fd; border-left: 4px solid #667eea; padding: 20px; margin: 25px 0; border-radius: 5px; }
          .features { display: flex; justify-content: space-around; margin: 30px 0; text-align: center; }
          .feature { flex: 1; margin: 0 10px; }
          .feature-icon { font-size: 24px; margin-bottom: 10px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎨 Welcome to NydArt Advisor!</h1>
            <p>You're now part of our creative community</p>
          </div>
          <div class="content">
            <h2>Hello ${username}! 👋</h2>
            <p>Welcome to the NydArt Advisor community! We're thrilled to have you join us on this creative journey.</p>
            
            <div class="highlight">
              <h3>🎯 What's Next?</h3>
              <p>Your account has been successfully created and you're ready to start exploring the world of digital art and creativity.</p>
            </div>
            
            <div style="text-align: center;">
              <a href="${loginLink}" class="button">Start Your Journey</a>
            </div>
            
            <div class="features">
              <div class="feature">
                <div class="feature-icon">🎨</div>
                <h4>Create</h4>
                <p>Express your creativity</p>
              </div>
              <div class="feature">
                <div class="feature-icon">🤝</div>
                <h4>Connect</h4>
                <p>Join the community</p>
              </div>
              <div class="feature">
                <div class="feature-icon">🚀</div>
                <h4>Grow</h4>
                <p>Learn and improve</p>
              </div>
            </div>
            
            <h3>🌟 What You Can Do:</h3>
            <ul>
              <li>Create and share your digital artwork</li>
              <li>Connect with fellow artists and creators</li>
              <li>Get personalized art recommendations</li>
              <li>Participate in community challenges</li>
              <li>Access exclusive tutorials and resources</li>
            </ul>
            
            <div class="highlight">
              <p><strong>💡 Tip:</strong> Complete your profile to get the most out of your NydArt Advisor experience!</p>
            </div>
            
            <p>If you have any questions or need help getting started, don't hesitate to reach out to our support team.</p>
            
            <p>Happy creating! 🎨</p>
            <p><em>The NydArt Advisor Team</em></p>
          </div>
          <div class="footer">
            <p>Welcome to the NydArt Advisor community! 🎨</p>
            <p>If you have any questions, please contact our support team.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: (username, loginLink) => `
      Welcome to NydArt Advisor! 🎨
      
      Hello ${username}! 👋
      
      Welcome to the NydArt Advisor community! We're thrilled to have you join us on this creative journey.
      
      Your account has been successfully created and you're ready to start exploring the world of digital art and creativity.
      
      Start Your Journey: ${loginLink}
      
      🌟 What You Can Do:
      - Create and share your digital artwork
      - Connect with fellow artists and creators
      - Get personalized art recommendations
      - Participate in community challenges
      - Access exclusive tutorials and resources
      
      💡 Tip: Complete your profile to get the most out of your NydArt Advisor experience!
      
      If you have any questions or need help getting started, don't hesitate to reach out to our support team.
      
      Happy creating! 🎨
      
      The NydArt Advisor Team
      
      Welcome to the NydArt Advisor community! 🎨
      If you have any questions, please contact our support team.
    `
  },
  securityAlertTemplate: {
    subject: '🔒 Security Alert - New Login Detected - NydArt Advisor',
    html: (username, loginTime, deviceInfo, location, loginLink, supportLink) => `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Security Alert - New Login</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .alert-box { background: #fff3cd; border: 2px solid #ffc107; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .info-box { background: #e8f4fd; border: 1px solid #bee5eb; padding: 15px; border-radius: 5px; margin: 15px 0; }
          .button { display: inline-block; background: #ff6b6b; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; margin: 15px 5px; font-weight: bold; }
          .button-secondary { background: #6c757d; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
          .details { background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 15px 0; }
          .detail-row { display: flex; justify-content: space-between; margin: 8px 0; }
          .detail-label { font-weight: bold; color: #495057; }
          .detail-value { color: #6c757d; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔒 Security Alert</h1>
            <p>New Login Detected</p>
          </div>
          <div class="content">
            <h2>Hello ${username}!</h2>
            
            <div class="alert-box">
              <h3>⚠️ New Login Detected</h3>
              <p>We detected a new login to your NydArt Advisor account. If this was you, you can safely ignore this email.</p>
            </div>
            
            <div class="details">
              <h4>Login Details:</h4>
              <div class="detail-row">
                <span class="detail-label">Time:</span>
                <span class="detail-value">${loginTime}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Device:</span>
                <span class="detail-value">${deviceInfo}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Location:</span>
                <span class="detail-value">${location}</span>
              </div>
            </div>
            
            <div class="info-box">
              <h4>🔍 What to do next:</h4>
              <ul>
                <li><strong>If this was you:</strong> No action needed - your account is secure</li>
                <li><strong>If this wasn't you:</strong> Change your password immediately and contact support</li>
                <li><strong>Enable 2FA:</strong> Consider enabling two-factor authentication for extra security</li>
              </ul>
            </div>
            
            <div style="text-align: center;">
              <a href="${loginLink}" class="button">Review Account Activity</a>
              <a href="${supportLink}" class="button button-secondary">Contact Support</a>
            </div>
            
            <div class="info-box">
              <h4>🛡️ Security Tips:</h4>
              <ul>
                <li>Use a strong, unique password</li>
                <li>Enable two-factor authentication</li>
                <li>Never share your login credentials</li>
                <li>Log out from shared devices</li>
                <li>Regularly review your account activity</li>
              </ul>
            </div>
          </div>
          <div class="footer">
            <p>This is an automated security alert from NydArt Advisor.</p>
            <p>If you have any concerns, please contact our support team immediately.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: (username, loginTime, deviceInfo, location, loginLink, supportLink) => `
      🔒 Security Alert - New Login Detected - NydArt Advisor
      
      Hello ${username}!
      
      ⚠️ New Login Detected
      
      We detected a new login to your NydArt Advisor account. If this was you, you can safely ignore this email.
      
      Login Details:
      - Time: ${loginTime}
      - Device: ${deviceInfo}
      - Location: ${location}
      
      🔍 What to do next:
      - If this was you: No action needed - your account is secure
      - If this wasn't you: Change your password immediately and contact support
      - Enable 2FA: Consider enabling two-factor authentication for extra security
      
      Review Account Activity: ${loginLink}
      Contact Support: ${supportLink}
      
      🛡️ Security Tips:
      - Use a strong, unique password
      - Enable two-factor authentication
      - Never share your login credentials
      - Log out from shared devices
      - Regularly review your account activity
      
      This is an automated security alert from NydArt Advisor.
      If you have any concerns, please contact our support team immediately.
    `
  }
};

module.exports = {
  initializeNodemailer,
  emailConfig
}; 