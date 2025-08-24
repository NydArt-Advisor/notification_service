# Notification Service - Technical Documentation

## Table of Contents
1. [Service Overview](#service-overview)
2. [Technology Stack](#technology-stack)
3. [Architecture](#architecture)
4. [Installation & Setup](#installation--setup)
5. [Configuration](#configuration)
6. [API Reference](#api-reference)
7. [Deployment Guide](#deployment-guide)
8. [User Manual](#user-manual)
9. [Update Manual](#update-manual)
10. [Monitoring & Troubleshooting](#monitoring--troubleshooting)
11. [Security Considerations](#security-considerations)
12. [Testing](#testing)

## Service Overview

The Notification Service is a microservice responsible for handling all email and SMS notifications within the NydArt Advisor application. It provides a unified interface for sending various types of notifications including password reset emails, welcome emails, security alerts, and SMS notifications.

### Key Features
- **Multi-Provider Email Support**: Supports both SendGrid and Nodemailer with automatic fallback
- **SMS Notifications**: Twilio integration for SMS delivery
- **Template System**: HTML and text email templates with dynamic content
- **Health Monitoring**: Prometheus metrics and health checks
- **Error Handling**: Graceful degradation and retry mechanisms
- **Security**: Input validation and secure email delivery

### Service Responsibilities
- Send password reset emails
- Send welcome emails to new users
- Send security alerts for suspicious activities
- Send SMS notifications
- Provide email service health checks
- Monitor notification delivery metrics

## Technology Stack

### Core Technologies
- **Runtime**: Node.js 18+
- **Framework**: Express.js 4.18.2
- **Language**: JavaScript (ES6+)

### Email Services
- **SendGrid**: Primary email delivery service
- **Nodemailer**: Alternative email delivery with SMTP support

### SMS Services
- **Twilio**: SMS delivery service

### Monitoring & Metrics
- **Prometheus**: Metrics collection and monitoring
- **prom-client**: Prometheus client for Node.js

### Development & Testing
- **Mocha**: Test framework
- **Chai**: Assertion library
- **Sinon**: Mocking and stubbing
- **Supertest**: HTTP testing
- **NYC**: Code coverage

### Utilities
- **CORS**: Cross-origin resource sharing
- **dotenv**: Environment variable management
- **Axios**: HTTP client for service communication

## Architecture

### Service Structure
```
notification_service/
├── src/
│   ├── server.js              # Main application entry point
│   ├── routes/
│   │   └── notificationRoutes.js  # API route definitions
│   ├── controllers/
│   │   └── notificationController.js  # Request handlers
│   ├── services/
│   │   ├── emailService.js    # SendGrid email service
│   │   ├── nodemailerService.js  # Nodemailer email service
│   │   ├── twilioService.js   # SMS service
│   │   └── notificationService.js  # Main notification orchestrator
│   ├── config/
│   │   ├── sendgrid.js        # SendGrid configuration
│   │   └── nodemailer.js      # Nodemailer configuration
│   └── test/                  # Test suite
├── package.json
└── .env                       # Environment variables
```

### Data Flow
1. **Request Reception**: Express.js receives HTTP requests
2. **Route Handling**: Routes direct requests to appropriate controllers
3. **Validation**: Input validation and sanitization
4. **Service Selection**: Choose appropriate email/SMS service
5. **Template Processing**: Apply dynamic content to templates
6. **Delivery**: Send via configured provider
7. **Response**: Return success/error response to client

### Service Dependencies
- **Frontend Service**: Receives notification requests
- **Auth Service**: May trigger security alerts
- **Database Service**: May query user information for notifications

## Installation & Setup

### Prerequisites
- Node.js 18+ installed
- npm or yarn package manager
- Access to email service providers (SendGrid/Twilio)

### Installation Steps

1. **Clone and Navigate**
   ```bash
   cd notification_service
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Verify Installation**
   ```bash
   npm test
   ```

### Service Providers Setup

#### SendGrid Setup
1. Create SendGrid account at https://sendgrid.com
2. Generate API key in SendGrid dashboard
3. Verify sender email address
4. Add API key to `.env` file

#### Twilio Setup
1. Create Twilio account at https://twilio.com
2. Get Account SID and Auth Token
3. Purchase phone number for SMS
4. Add credentials to `.env` file

#### Nodemailer Setup (Optional)
1. Configure SMTP settings in `.env`
2. Test SMTP connection
3. Verify email templates

## Configuration

### Environment Variables

#### Server Configuration
```env
PORT=4003
NODE_ENV=production
```

#### Email Services
```env
# SendGrid Configuration
SENDGRID_API_KEY=your_sendgrid_api_key
SENDGRID_FROM_EMAIL=noreply@yourdomain.com
SENDGRID_FROM_NAME=NydArt Advisor

# Nodemailer Configuration (Optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
SMTP_FROM=noreply@yourdomain.com
SMTP_FROM_NAME=NydArt Advisor
```

#### SMS Services
```env
# Twilio Configuration
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+1234567890
```

#### Service URLs
```env
FRONTEND_URL=https://your-frontend-domain.com
CLIENT_URL=https://your-client-domain.com
```

#### Security & Rate Limiting
```env
CORS_ORIGINS=https://your-frontend-domain.com
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Configuration Files

#### SendGrid Configuration (`src/config/sendgrid.js`)
- API key management
- Email template configuration
- Sender verification

#### Nodemailer Configuration (`src/config/nodemailer.js`)
- SMTP server settings
- Email templates
- Transport configuration

## API Reference

### Base URL
```
http://localhost:4003 (development)
https://your-notification-service.com (production)
```

### Endpoints

#### Health Check
```http
GET /health
```
**Response:**
```json
{
  "status": "ok",
  "service": "notification-mail-sms-service",
  "emailServices": {
    "nodemailer": "configured",
    "sendgrid": "configured"
  }
}
```

#### Test Email Service
```http
GET /test-email-service
```
**Response:**
```json
{
  "success": true,
  "message": "Email service is working",
  "method": "sendgrid"
}
```

#### Send Test Email
```http
POST /test-email
```
**Response:**
```json
{
  "success": true,
  "message": "Test email sent successfully",
  "messageId": "abc123"
}
```

#### Send Password Reset Email
```http
POST /password-reset
Content-Type: application/json

{
  "email": "user@example.com",
  "resetToken": "reset_token_here"
}
```
**Response:**
```json
{
  "success": true,
  "message": "Password reset email sent successfully",
  "messageId": "abc123"
}
```

#### Send Welcome Email
```http
POST /welcome
Content-Type: application/json

{
  "email": "user@example.com",
  "username": "John Doe",
  "loginLink": "https://app.com/login"
}
```
**Response:**
```json
{
  "success": true,
  "message": "Welcome email sent successfully",
  "messageId": "abc123",
  "method": "sendgrid"
}
```

#### Send Security Alert
```http
POST /security-alert
Content-Type: application/json

{
  "email": "user@example.com",
  "username": "John Doe",
  "loginTime": "2024-01-15T10:30:00Z",
  "deviceInfo": "Chrome on Windows",
  "location": "New York, NY",
  "loginLink": "https://app.com/dashboard",
  "supportLink": "https://app.com/support"
}
```
**Response:**
```json
{
  "success": true,
  "message": "Security alert sent successfully",
  "messageId": "abc123",
  "method": "sendgrid"
}
```

### Error Responses

#### Validation Error (400)
```json
{
  "success": false,
  "message": "Email and resetToken are required"
}
```

#### Service Error (500)
```json
{
  "success": false,
  "message": "Failed to send email",
  "error": "Detailed error message"
}
```

## Deployment Guide

### Production Deployment

#### Environment Setup
1. **Set Production Environment**
   ```bash
   NODE_ENV=production
   ```

2. **Configure Production Variables**
   - Use production email service credentials
   - Set production URLs
   - Configure CORS for production domains

3. **SSL/TLS Configuration**
   - Ensure HTTPS endpoints
   - Configure SSL certificates
   - Set secure headers

#### Deployment Options

##### Docker Deployment
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 4003
CMD ["npm", "start"]
```

##### PM2 Deployment
```bash
npm install -g pm2
pm2 start src/server.js --name "notification-service"
pm2 save
pm2 startup
```

##### Cloud Platform Deployment
- **Render.com**: Connect GitHub repository
- **Heroku**: Use Heroku CLI or GitHub integration
- **AWS**: Use Elastic Beanstalk or ECS
- **Google Cloud**: Use App Engine or Cloud Run

#### Health Checks
```bash
# Check service health
curl https://your-service.com/health

# Check metrics
curl https://your-service.com/metrics
```

### Monitoring Setup

#### Prometheus Configuration
```yaml
scrape_configs:
  - job_name: 'notification-service'
    static_configs:
      - targets: ['localhost:4003']
    metrics_path: '/metrics'
```

#### Alert Rules
```yaml
groups:
  - name: notification-service
    rules:
      - alert: NotificationServiceDown
        expr: up{job="notification-service"} == 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "Notification service is down"
```

## User Manual

### For Developers

#### Sending Notifications
```javascript
// Password reset email
const response = await fetch('/password-reset', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    resetToken: 'token123'
  })
});

// Welcome email
const response = await fetch('/welcome', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    username: 'John Doe'
  })
});
```

#### Error Handling
```javascript
try {
  const response = await fetch('/password-reset', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  
  const result = await response.json();
  
  if (!result.success) {
    console.error('Notification failed:', result.message);
  }
} catch (error) {
  console.error('Request failed:', error);
}
```

### For System Administrators

#### Service Management
```bash
# Start service
npm start

# Start in development mode
npm run dev

# Run tests
npm test

# Check service health
curl http://localhost:4003/health
```

#### Log Monitoring
```bash
# View logs
tail -f logs/notification-service.log

# Monitor errors
grep "ERROR" logs/notification-service.log

# Monitor email delivery
grep "email sent" logs/notification-service.log
```

## Update Manual

### Version Updates

#### Minor Updates
1. **Backup Configuration**
   ```bash
   cp .env .env.backup
   ```

2. **Update Dependencies**
   ```bash
   npm update
   ```

3. **Test Changes**
   ```bash
   npm test
   ```

4. **Restart Service**
   ```bash
   pm2 restart notification-service
   ```

#### Major Updates
1. **Review Changelog**
   - Check breaking changes
   - Review new features
   - Verify compatibility

2. **Staging Deployment**
   - Deploy to staging environment
   - Run full test suite
   - Verify all notifications work

3. **Production Deployment**
   - Schedule maintenance window
   - Deploy with rollback plan
   - Monitor closely after deployment

### Configuration Updates

#### Email Provider Changes
1. **Update Environment Variables**
   ```bash
   # Update SendGrid API key
   SENDGRID_API_KEY=new_api_key
   
   # Update sender information
   SENDGRID_FROM_EMAIL=new@domain.com
   ```

2. **Test Configuration**
   ```bash
   curl http://localhost:4003/test-email-service
   ```

3. **Restart Service**
   ```bash
   pm2 restart notification-service
   ```

## Monitoring & Troubleshooting

### Key Metrics

#### Performance Metrics
- **Response Time**: Average API response time
- **Throughput**: Requests per second
- **Error Rate**: Percentage of failed requests
- **Email Delivery Rate**: Successful email deliveries

#### Business Metrics
- **Email Types Sent**: Password reset, welcome, security alerts
- **SMS Notifications**: Number of SMS sent
- **Template Usage**: Most used email templates

### Common Issues

#### Email Delivery Failures
**Symptoms:**
- 500 errors on email endpoints
- Failed email delivery logs
- Bounced emails

**Solutions:**
1. Check SendGrid API key validity
2. Verify sender email address
3. Check email content for spam triggers
4. Review SendGrid dashboard for bounces

#### Service Unavailability
**Symptoms:**
- 503 Service Unavailable errors
- Health check failures
- High response times

**Solutions:**
1. Check service process status
2. Review system resources
3. Check network connectivity
4. Verify environment variables

#### Template Rendering Issues
**Symptoms:**
- Malformed emails
- Missing dynamic content
- HTML rendering problems

**Solutions:**
1. Validate template syntax
2. Check dynamic content variables
3. Test template rendering
4. Review email client compatibility

### Debugging Tools

#### Log Analysis
```bash
# View real-time logs
tail -f logs/notification-service.log

# Search for specific errors
grep "ERROR" logs/notification-service.log | tail -20

# Monitor email delivery
grep "email sent" logs/notification-service.log | tail -10
```

#### Health Checks
```bash
# Basic health check
curl http://localhost:4003/health

# Detailed service status
curl http://localhost:4003/test-email-service

# Metrics endpoint
curl http://localhost:4003/metrics
```

#### Email Testing
```bash
# Send test email
curl -X POST http://localhost:4003/test-email

# Test specific email type
curl -X POST http://localhost:4003/welcome \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","username":"Test User"}'
```

## Security Considerations

### Input Validation
- All email addresses are validated
- Input sanitization prevents injection attacks
- Rate limiting prevents abuse

### Email Security
- SPF, DKIM, and DMARC records configured
- Secure SMTP connections (TLS)
- Email content scanning for malicious content

### API Security
- CORS configuration for allowed origins
- Rate limiting to prevent abuse
- Input validation and sanitization
- Secure headers configuration

### Data Protection
- No sensitive data logged
- Email content encrypted in transit
- Secure storage of API keys

### Compliance
- GDPR compliance for email communications
- CAN-SPAM Act compliance
- Data retention policies

## Testing

### Test Categories

#### Unit Tests
- Service function testing
- Template rendering tests
- Configuration validation
- Error handling tests

#### Integration Tests
- API endpoint testing
- Email service integration
- SMS service integration
- Database integration (if applicable)

#### Performance Tests
- Load testing
- Stress testing
- Email delivery performance
- Response time testing

### Running Tests

#### Full Test Suite
```bash
npm test
```

#### Specific Test Categories
```bash
# Unit tests only
npm run test:unit

# Integration tests only
npm run test:integration

# Performance tests only
npm run test:performance
```

#### Test Coverage
```bash
npm run test:coverage
```

### Test Configuration

#### Test Environment
```env
NODE_ENV=test
SENDGRID_API_KEY=test_key
TWILIO_ACCOUNT_SID=test_sid
```

#### Mock Services
- Email services mocked for testing
- SMS services mocked for testing
- External API calls mocked

### Continuous Integration

#### GitHub Actions
```yaml
name: Notification Service Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm ci
      - run: npm test
      - run: npm run test:coverage
```

#### Test Reports
- Coverage reports generated
- Test results published
- Performance metrics tracked

---

## Support & Maintenance

### Documentation Updates
- Keep this documentation current
- Update API examples
- Maintain troubleshooting guides

### Regular Maintenance
- Monitor service performance
- Update dependencies regularly
- Review security configurations
- Backup configurations

### Contact Information
- Technical issues: Create GitHub issue
- Security concerns: Contact security team
- General questions: Check documentation first

---

*Last Updated: January 2024*
*Version: 1.0.0*
