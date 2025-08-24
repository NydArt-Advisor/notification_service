const twilio = require('twilio');

class TwilioService {
    constructor() {
        this.accountSid = process.env.TWILIO_ACCOUNT_SID;
        this.authToken = process.env.TWILIO_AUTH_TOKEN;
        this.phoneNumber = process.env.TWILIO_PHONE_NUMBER;
        
        this.isInitialized = false;
        this.client = null;
        
        this.initialize();
    }

    initialize() {
        try {
            if (!this.accountSid || !this.authToken || !this.phoneNumber) {
                console.warn('⚠️ Twilio credentials not configured. SMS notifications will be disabled.');
                return;
            }

            this.client = twilio(this.accountSid, this.authToken);
            this.isInitialized = true;
            console.log('✅ Twilio SMS service initialized successfully');
        } catch (error) {
            console.error('❌ Error initializing Twilio service:', error);
            this.isInitialized = false;
        }
    }

    async sendSMS(to, message) {
        try {
            if (!this.isInitialized) {
                throw new Error('Twilio service not initialized');
            }

            // Validate phone number format
            if (!this.isValidPhoneNumber(to)) {
                throw new Error(`Invalid phone number format: ${to}`);
            }

            const result = await this.client.messages.create({
                body: message,
                from: this.phoneNumber,
                to: to
            });

            console.log(`✅ SMS sent successfully to ${to}. SID: ${result.sid}`);
            return {
                success: true,
                messageId: result.sid,
                status: result.status
            };

        } catch (error) {
            console.error(`❌ Error sending SMS to ${to}:`, error.message);
            return {
                success: false,
                error: error.message
            };
        }
    }

    async sendNotificationSMS(phoneNumber, title, message, data = {}) {
        try {
            // Format the SMS message
            const formattedMessage = this.formatNotificationMessage(title, message, data);
            
            return await this.sendSMS(phoneNumber, formattedMessage);
        } catch (error) {
            console.error('Error sending notification SMS:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    formatNotificationMessage(title, message, data = {}) {
        let formattedMessage = `🔔 ${title}\n\n${message}`;
        
        // Add additional data if provided
        if (data.actionUrl) {
            formattedMessage += `\n\n🔗 ${data.actionUrl}`;
        }
        
        if (data.priority === 'urgent') {
            formattedMessage = `🚨 URGENT: ${formattedMessage}`;
        }
        
        return formattedMessage;
    }

    isValidPhoneNumber(phoneNumber) {
        // Basic phone number validation (E.164 format)
        const phoneRegex = /^\+[1-9]\d{1,14}$/;
        return phoneRegex.test(phoneNumber);
    }

    // Get account information
    async getAccountInfo() {
        try {
            if (!this.isInitialized) {
                throw new Error('Twilio service not initialized');
            }

            const account = await this.client.api.accounts(this.accountSid).fetch();
            return {
                accountSid: account.sid,
                accountName: account.friendlyName,
                status: account.status,
                balance: account.balance,
                currency: account.currency
            };
        } catch (error) {
            console.error('Error getting Twilio account info:', error);
            return null;
        }
    }

    // Test SMS functionality
    async testSMS(testPhoneNumber) {
        try {
            const testMessage = '🧪 This is a test SMS from NydArt Advisor notification service.';
            const result = await this.sendSMS(testPhoneNumber, testMessage);
            
            if (result.success) {
                console.log('✅ Test SMS sent successfully');
            } else {
                console.log('❌ Test SMS failed:', result.error);
            }
            
            return result;
        } catch (error) {
            console.error('Error in test SMS:', error);
            return { success: false, error: error.message };
        }
    }
}

module.exports = new TwilioService();
