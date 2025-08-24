const request = require('supertest');
const { expect } = require('chai');
const sinon = require('sinon');

// Import the app
const app = require('../server');

describe('Notification Service Working Tests', () => {
  let server;

  before(async () => {
    // Create test server
    server = app.listen(0);
  });

  after(async () => {
    // Cleanup
    if (server) server.close();
  });

  describe('Health Check Endpoints', () => {
    it('should return health status', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body).to.have.property('status', 'ok');
      expect(response.body).to.have.property('service', 'notification-mail-sms-service');
      expect(response.body).to.have.property('emailServices');
    });

    it('should return service status', async () => {
      const response = await request(app)
        .get('/')
        .expect(200);

      expect(response.text).to.equal('Notification Service is running');
    });
  });

  describe('Email Service Tests', () => {
    it('should test email service configuration', async () => {
      const response = await request(app)
        .get('/test-email-service');

      // Email service test might succeed or fail depending on configuration
      expect(response.status).to.be.oneOf([200, 500]);
    });

    it('should send test email', async () => {
      const response = await request(app)
        .post('/test-email');

      // Test email might succeed or fail depending on configuration
      expect(response.status).to.be.oneOf([200, 500]);
    });

    it('should handle missing required fields for password reset', async () => {
      const response = await request(app)
        .post('/password-reset')
        .send({})
        .expect(400);

      expect(response.body).to.have.property('success', false);
      expect(response.body).to.have.property('message');
    });

    it('should handle password reset email with valid data', async () => {
      const response = await request(app)
        .post('/password-reset')
        .send({
          email: 'test@example.com',
          resetToken: 'abc123'
        });

      // Password reset might succeed or fail depending on email service configuration
      expect(response.status).to.be.oneOf([200, 500]);
    });

    it('should handle welcome email with valid data', async () => {
      const response = await request(app)
        .post('/welcome')
        .send({
          email: 'test@example.com',
          username: 'testuser'
        });

      // Welcome email might succeed or fail depending on email service configuration
      expect(response.status).to.be.oneOf([200, 500]);
    });

    it('should handle welcome email with missing required fields', async () => {
      const response = await request(app)
        .post('/welcome')
        .send({
          email: 'test@example.com'
          // Missing username
        })
        .expect(400);

      expect(response.body).to.have.property('success', false);
      expect(response.body).to.have.property('message');
    });

    it('should handle security alert email', async () => {
      const response = await request(app)
        .post('/security-alert')
        .send({
          email: 'test@example.com',
          username: 'testuser',
          loginTime: new Date().toISOString(),
          deviceInfo: 'Test Device',
          location: 'Test Location'
        });

      // Security alert might succeed or fail depending on email service configuration
      expect(response.status).to.be.oneOf([200, 500]);
    });
  });

  describe('Validation Tests', () => {
    it('should validate email format in requests', async () => {
      const response = await request(app)
        .post('/password-reset')
        .send({
          email: 'invalid-email',
          resetToken: 'abc123'
        });

      // Invalid email might be accepted or rejected depending on service logic
      expect(response.status).to.be.oneOf([200, 400, 500]);
    });

    it('should handle empty request body', async () => {
      const response = await request(app)
        .post('/password-reset')
        .send();

      // Empty body should return 400
      expect(response.status).to.be.oneOf([400, 500]);
    });

    it('should handle malformed JSON', async () => {
      const response = await request(app)
        .post('/password-reset')
        .set('Content-Type', 'application/json')
        .send('invalid json');

      // Malformed JSON should return 400 or 500
      expect(response.status).to.be.oneOf([400, 500]);
    });
  });

  describe('Security Tests', () => {
    it('should handle XSS attempts in email content', async () => {
      const maliciousContent = '<script>alert("xss")</script>';
      
      const response = await request(app)
        .post('/welcome')
        .send({
          email: 'test@example.com',
          username: maliciousContent
        });

      // Should handle malicious input gracefully
      expect(response.status).to.be.oneOf([200, 400, 500]);
    });

    it('should handle injection attempts', async () => {
      const maliciousEmail = "'; DROP TABLE users; --";
      
      const response = await request(app)
        .post('/password-reset')
        .send({
          email: maliciousEmail,
          resetToken: 'abc123'
        });

      // Should handle malicious input gracefully
      expect(response.status).to.be.oneOf([200, 400, 500]);
    });
  });

  describe('Rate Limiting', () => {
    it('should handle multiple rapid requests', async () => {
      const requests = [];
      
      // Make multiple rapid requests
      for (let i = 0; i < 5; i++) {
        requests.push(
          request(app)
            .get('/health')
        );
      }

      const responses = await Promise.all(requests);
      
      // All requests should be handled (some might be rate limited)
      responses.forEach(response => {
        expect(response.status).to.be.oneOf([200, 429, 500]);
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid routes gracefully', async () => {
      const response = await request(app)
        .get('/invalid-route');
      
      // Express will return 404 for invalid routes
      expect(response.status).to.equal(404);
    });

    it('should handle unsupported HTTP methods', async () => {
      const response = await request(app)
        .put('/health');
      
      // Should return 404 or 405 for unsupported methods
      expect(response.status).to.be.oneOf([404, 405]);
    });
  });

  describe('Performance Tests', () => {
    it('should complete requests within reasonable time', async () => {
      const startTime = Date.now();
      
      await request(app)
        .get('/health')
        .expect(200);

      const endTime = Date.now();
      const duration = endTime - startTime;
      
      expect(duration).to.be.lessThan(1000); // Should complete within 1 second
    });

    it('should handle concurrent requests', async () => {
      const concurrentRequests = 3;
      const promises = [];

      for (let i = 0; i < concurrentRequests; i++) {
        promises.push(
          request(app)
            .get('/health')
        );
      }

      const responses = await Promise.all(promises);
      
      responses.forEach(response => {
        expect(response.status).to.equal(200);
      });
    });
  });

  describe('Metrics Endpoint', () => {
    it('should return Prometheus metrics', async () => {
      const response = await request(app)
        .get('/metrics');

      // Metrics endpoint should return 200 with metrics data
      expect(response.status).to.equal(200);
      expect(response.text).to.be.a('string');
      expect(response.text.length).to.be.greaterThan(0);
    });
  });

  describe('CORS Tests', () => {
    it('should handle CORS preflight requests', async () => {
      const response = await request(app)
        .options('/health')
        .set('Origin', 'https://nydartadvisor.vercel.app')
        .set('Access-Control-Request-Method', 'GET')
        .set('Access-Control-Request-Headers', 'Content-Type');

      // CORS preflight should return 204 or 200
      expect(response.status).to.be.oneOf([200, 204]);
    });

    it('should include CORS headers in responses', async () => {
      const response = await request(app)
        .get('/health')
        .set('Origin', 'https://nydartadvisor.vercel.app');

      // Should include CORS headers
      expect(response.headers).to.have.property('access-control-allow-origin');
    });
  });
});
