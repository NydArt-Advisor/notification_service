# Quick Setup Guide - Gmail with Nodemailer

## 🚀 Get Email Working in 5 Minutes

### Step 1: Enable 2-Factor Authentication
1. Go to [myaccount.google.com](https://myaccount.google.com)
2. Click **Security** → **2-Step Verification**
3. Turn on 2-Step Verification

### Step 2: Generate App Password
1. Go to **Security** → **App passwords**
2. Select **"Mail"** and **"Other (Custom name)"**
3. Enter **"NydArt Advisor"** as the name
4. Click **Generate**
5. **Copy the 16-character password** (you'll only see it once!)

### Step 3: Create Environment File
Create `.env` file in the notification service directory:

```env
# Gmail Configuration
EMAIL_PROVIDER=gmail
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_16_char_app_password
EMAIL_FROM=your_email@gmail.com
EMAIL_FROM_NAME=NydArt Advisor

# Frontend URL
FRONTEND_URL=http://localhost:3000

# Test email
TEST_EMAIL=your_email@gmail.com

# Server
PORT=4003
NODE_ENV=development
```

### Step 4: Restart the Service
```bash
# Stop the current service (Ctrl+C)
# Then restart it
npm run dev
```

### Step 5: Test It
```bash
# Test connection
curl http://localhost:4003/test-email

# Send test email
curl -X POST http://localhost:4003/send-test-email

# Test password reset
curl -X POST http://localhost:4003/notify/email/password-reset \
  -H "Content-Type: application/json" \
  -d '{"email":"your_email@gmail.com","resetToken":"test-token"}'
```

## ✅ You're Done!

Your notification service is now configured to send real emails using Gmail!

## 🔧 Troubleshooting

**"Invalid login" error?**
- Make sure you're using the App Password, not your regular password
- Ensure 2-Factor Authentication is enabled

**"Less secure app" error?**
- This is normal - App Passwords bypass this restriction

**Service not starting?**
- Check that all environment variables are set correctly
- Make sure the `.env` file is in the right directory

## 📧 Test from Frontend

Now you can test the complete forgot password flow from your frontend - it will send real emails!

## Quick Setup Guide

This guide will help you quickly set up the notification service with email functionality.

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Configuration
Copy the example environment file and configure your email settings:

```bash
cp env.example .env
```

### 3. Email Service Setup

#### Option A: Gmail (Recommended for testing)
1. Enable 2-Factor Authentication on your Gmail account
2. Generate an App Password:
   - Go to Google Account Settings
   - Security → 2-Step Verification → App passwords
   - Generate a password for "Mail"
3. Update your `.env` file:
   ```env
   EMAIL_PROVIDER=gmail
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASSWORD=your-app-password
   EMAIL_FROM=your-email@gmail.com
   EMAIL_FROM_NAME=NydArt Advisor
   ```

#### Option B: SendGrid (Recommended for production)
1. Create a SendGrid account
2. Generate an API key
3. Update your `.env` file:
   ```env
   EMAIL_PROVIDER=sendgrid
   SENDGRID_API_KEY=your-api-key
   EMAIL_FROM=your-verified-sender@yourdomain.com
   EMAIL_FROM_NAME=NydArt Advisor
   ```

### 4. Start the Service
```bash
npm start
```

The service will run on port 4003 by default.

### 5. Test the Setup

#### Test Configuration
```bash
curl http://localhost:4003/test-config
```

#### Test Email Sending
```bash
curl -X POST http://localhost:4003/test-email \
  -H "Content-Type: application/json" \
  -d '{
    "to": "test@example.com",
    "subject": "Test Email",
    "message": "This is a test email"
  }'
```

#### Test Welcome Email
```bash
curl -X POST http://localhost:4003/welcome \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newuser@example.com",
    "username": "newuser",
    "loginLink": "http://localhost:3000/login"
  }'
```

### 6. Integration with Auth Service

The notification service is automatically called by the auth service for:
- **Password Reset Emails:** When users request password reset
- **Welcome Emails:** When new users register (both local and Google OAuth)

### 7. Email Templates

The service includes beautiful, responsive email templates:
- **Password Reset:** Secure reset links with expiration warnings
- **Welcome Email:** Community welcome with feature highlights and getting started tips

Both templates include:
- HTML and text versions
- Responsive design
- Branded styling
- Clear call-to-action buttons 