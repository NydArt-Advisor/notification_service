# Notification Mail SMS Service

This microservice handles email and SMS notifications for the NydArt Advisor application.

## Features

- **Email Notifications**: Password reset emails via Nodemailer (recommended) or SendGrid
- **SMS Notifications**: Coming soon via Twilio
- **Health Checks**: Service status monitoring
- **Error Handling**: Comprehensive error handling and logging
- **Multiple Email Providers**: Support for Gmail, Outlook, Yahoo, and custom SMTP

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Email Service Configuration

#### Option A: Nodemailer (Recommended for Development)

**Gmail Setup:**
1. **Enable 2-Factor Authentication** on your Google account
2. **Generate App Password**:
   - Go to Google Account settings → Security → App passwords
   - Select "Mail" and generate a password
   - Use this app password (not your regular password)

**Outlook/Hotmail Setup:**
- Use your regular email and password
- Set `EMAIL_PROVIDER=outlook`

**Yahoo Setup:**
- Use your regular email and password
- Set `EMAIL_PROVIDER=yahoo`

#### Option B: SendGrid (Alternative)

1. Go to [sendgrid.com](https://sendgrid.com)
2. Sign up for a free account (100 emails/day)
3. Get API key from Settings → API Keys
4. Verify sender email in Settings → Sender Authentication

### 3. Environment Variables

Create a `.env` file in the root directory:

```env
# Nodemailer Configuration (Recommended)
EMAIL_PROVIDER=gmail
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
EMAIL_FROM=your_email@gmail.com
EMAIL_FROM_NAME=NydArt Advisor

# OR SendGrid Configuration (Alternative)
# SENDGRID_API_KEY=your_sendgrid_api_key_here
# SENDGRID_FROM_EMAIL=noreply@yourdomain.com
# SENDGRID_FROM_NAME=NydArt Advisor

# Frontend URL for reset links
FRONTEND_URL=http://localhost:3000

# Test email recipient
TEST_EMAIL=test@example.com

# Server Configuration
PORT=4003
NODE_ENV=development
```

### 4. Start the Service

```bash
# Development mode
npm run dev

# Production mode
npm start
```

## API Endpoints

### Health Check
- **GET** `/health` - Check service health

### Test Configuration
- **GET** `/test-config` - Test email service configuration

### Test Email
- **POST** `/test-email` - Send a test email
- **Body:**
  ```json
  {
    "to": "test@example.com",
    "subject": "Test Email",
    "message": "This is a test email"
  }
  ```

### Password Reset Email
- **POST** `/password-reset` - Send password reset email
- **Body:**
  ```json
  {
    "email": "user@example.com",
    "resetToken": "reset_token_here"
  }
  ```

### Welcome Email
- **POST** `/welcome` - Send welcome email to new users
- **Body:**
  ```json
  {
    "email": "user@example.com",
    "username": "username",
    "loginLink": "http://localhost:3000/login"
  }
  ```
- **Description:** Sends a beautiful welcome email to new users when they register
- **Features:**
  - Personalized greeting with username
  - Community welcome message
  - Feature highlights (Create, Connect, Grow)
  - Call-to-action button to start using the app
  - Tips for getting started
  - Responsive design with modern styling

## Email Service Priority

The service uses the following priority:
1. **Nodemailer** (if configured)
2. **SendGrid** (if Nodemailer not configured)
3. **Test response** (if neither configured)

## Email Templates

### Password Reset Template
- **Subject:** "Reset Your Password - NydArt Advisor"
- **Features:**
  - Secure reset link with expiration
  - Clear instructions
  - Security warnings
  - Fallback text version

### Welcome Email Template
- **Subject:** "Welcome to NydArt Advisor! 🎨"
- **Features:**
  - Beautiful gradient header
  - Personalized greeting
  - Community introduction
  - Feature highlights with icons
  - Call-to-action button
  - Getting started tips
  - Responsive design
  - Both HTML and text versions

## Error Handling

The service includes comprehensive error handling:
- Email provider errors
- Network connectivity issues
- Invalid email addresses
- Missing configuration
- Authentication failures

## Testing

### Test Email Service
```bash
curl http://localhost:4003/test-email
```

### Send Test Email
```bash
curl -X POST http://localhost:4003/send-test-email
```

### Test Password Reset Email
```bash
curl -X POST http://localhost:4003/notify/email/password-reset \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","resetToken":"test-token"}'
```

## Architecture

```
src/
├── server.js                 # Main server file
├── config/
│   ├── sendgrid.js          # SendGrid configuration
│   └── nodemailer.js        # Nodemailer configuration
├── controllers/
│   └── notificationController.js  # Request handlers
├── routes/
│   └── notificationRoutes.js      # Route definitions
└── services/
    ├── emailService.js      # SendGrid email logic
    └── nodemailerService.js # Nodemailer email logic
```

## Troubleshooting

### Nodemailer Issues
1. **Gmail**: Use App Password, not regular password
2. **Authentication**: Enable 2FA and generate app password
3. **Less secure apps**: Disable "Less secure app access"
4. **Check logs**: Review service logs for detailed error messages

### SendGrid Issues
1. Check your API key is correct
2. Verify your sender email is authenticated
3. Check SendGrid dashboard for any blocks or issues

### Email Not Sending
1. Ensure email credentials are set in environment
2. Check email provider settings
3. Verify the recipient email is valid
4. Check service logs for error details

## Gmail App Password Setup

1. **Enable 2-Factor Authentication**:
   - Go to Google Account settings
   - Security → 2-Step Verification → Turn on

2. **Generate App Password**:
   - Security → App passwords
   - Select "Mail" and "Other (Custom name)"
   - Enter "NydArt Advisor" as the name
   - Copy the generated 16-character password

3. **Use in Environment**:
   ```env
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASSWORD=your_16_char_app_password
   ```

## Future Enhancements

- [ ] SMS notifications via Twilio
- [ ] Email templates for other notifications
- [ ] Email tracking and analytics
- [ ] Bulk email sending
- [ ] Email preferences management 