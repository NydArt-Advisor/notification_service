const axios = require('axios');
const emailService = require('./emailService');
const nodemailerService = require('./nodemailerService');
const twilioService = require('./twilioService');

class NotificationService {
    constructor() {
        this.dbServiceUrl = process.env.DB_SERVICE_URL;
        this.authServiceUrl = process.env.AUTH_SERVICE_URL;
    }

    // Create notification in database
    async createNotification(notificationData) {
        try {
            const response = await axios.post(`${this.dbServiceUrl}/notifications`, notificationData);
            return response.data;
        } catch (error) {
            console.error('Error creating notification in database:', error);
            throw error;
        }
    }

    // Get user notification preferences
    async getUserPreferences(userId) {
        try {
            const response = await axios.get(`${this.dbServiceUrl}/users/${userId}`);
            return response.data.notificationPreferences || {
                email: { enabled: true, categories: {} },
                sms: { enabled: false, categories: {} },
                inApp: { enabled: true, categories: {} }
            };
        } catch (error) {
            console.error('Error getting user preferences:', error);
            return {
                email: { enabled: true, categories: {} },
                sms: { enabled: false, categories: {} },
                inApp: { enabled: true, categories: {} }
            };
        }
    }

    // Send email notification
    async sendEmailNotification(userId, email, category, title, message, data = {}) {
        try {
            const preferences = await this.getUserPreferences(userId);
            
            if (!preferences.email.enabled || !preferences.email.categories[category]) {
                console.log(`Email notifications disabled for user ${userId} or category ${category}`);
                return { success: false, reason: 'disabled' };
            }

            let result;
            if (nodemailerService.isInitialized) {
                result = await nodemailerService.sendNotificationEmail(email, title, message, data);
            } else if (emailService.isInitialized) {
                result = await emailService.sendNotificationEmail(email, title, message, data);
            } else {
                console.warn('No email service configured');
                return { success: false, reason: 'no_service' };
            }

            return result;
        } catch (error) {
            console.error('Error sending email notification:', error);
            return { success: false, error: error.message };
        }
    }

    // Send SMS notification using Twilio
    async sendSMSNotification(userId, phoneNumber, category, message, data = {}) {
        try {
            const preferences = await this.getUserPreferences(userId);
            
            if (!preferences.sms.enabled || !preferences.sms.categories[category]) {
                console.log(`SMS notifications disabled for user ${userId} or category ${category}`);
                return { success: false, reason: 'disabled' };
            }

            if (!twilioService.isInitialized) {
                console.warn('Twilio SMS service not initialized');
                return { success: false, reason: 'service_unavailable' };
            }

            // Get notification title based on category
            const title = this.getNotificationTitle(category);
            
            const result = await twilioService.sendNotificationSMS(phoneNumber, title, message, data);
            
            if (result.success) {
                console.log(`✅ SMS notification sent successfully to ${phoneNumber}`);
            } else {
                console.error(`❌ Failed to send SMS to ${phoneNumber}:`, result.error);
            }
            
            return result;
        } catch (error) {
            console.error('Error sending SMS notification:', error);
            return { success: false, error: error.message };
        }
    }

    // Create in-app notification
    async createInAppNotification(userId, category, title, message, data = {}) {
        try {
            const preferences = await this.getUserPreferences(userId);
            
            if (!preferences.inApp.enabled || !preferences.inApp.categories[category]) {
                console.log(`In-app notifications disabled for user ${userId} or category ${category}`);
                return { success: false, reason: 'disabled' };
            }

            const notificationData = {
                userId,
                type: 'in_app',
                category,
                title,
                message,
                data,
                status: 'pending',
                priority: this.getPriorityForCategory(category)
            };

            const result = await this.createNotification(notificationData);
            return { success: true, notification: result };
        } catch (error) {
            console.error('Error creating in-app notification:', error);
            return { success: false, error: error.message };
        }
    }

    // Send comprehensive notification (all types)
    async sendNotification(userId, category, title, message, data = {}) {
        try {
            // Get user data
            const userResponse = await axios.get(`${this.dbServiceUrl}/users/${userId}`);
            const user = userResponse.data;
            
            const results = {
                email: { success: false },
                sms: { success: false },
                inApp: { success: false }
            };

            // Send email notification
            if (user.email) {
                results.email = await this.sendEmailNotification(userId, user.email, category, title, message, data);
            }

            // Send SMS notification
            if (user.phone && user.phone.number) {
                results.sms = await this.sendSMSNotification(userId, user.phone.number, category, message, data);
            }

            // Create in-app notification
            results.inApp = await this.createInAppNotification(userId, category, title, message, data);

            return {
                success: true,
                results,
                summary: {
                    email: results.email.success,
                    sms: results.sms.success,
                    inApp: results.inApp.success
                }
            };
        } catch (error) {
            console.error('Error sending comprehensive notification:', error);
            return { success: false, error: error.message };
        }
    }

    // Get priority for notification category
    getPriorityForCategory(category) {
        const priorityMap = {
            security_alert: 'urgent',
            analysis_failed: 'high',
            password_reset: 'high',
            analysis_complete: 'normal',
            account_update: 'normal',
            subscription: 'normal',
            welcome: 'low',
            artwork_added: 'low',
            artwork_updated: 'low',
            system_alert: 'normal'
        };
        return priorityMap[category] || 'normal';
    }

    // Send analysis complete notification
    async sendAnalysisCompleteNotification(userId, analysisData) {
        const title = 'Analysis Complete';
        const message = `Your artwork "${analysisData.artworkTitle}" has been analyzed successfully.`;
        const data = {
            analysisId: analysisData.id,
            artworkTitle: analysisData.artworkTitle,
            accuracy: analysisData.accuracy,
            type: 'analysis_complete'
        };

        return await this.sendNotification(userId, 'analysis_complete', title, message, data);
    }

    // Send analysis failed notification
    async sendAnalysisFailedNotification(userId, analysisData) {
        const title = 'Analysis Failed';
        const message = `We couldn't analyze your artwork "${analysisData.artworkTitle}". Please try again.`;
        const data = {
            artworkTitle: analysisData.artworkTitle,
            error: analysisData.error,
            type: 'analysis_failed'
        };

        return await this.sendNotification(userId, 'analysis_failed', title, message, data);
    }

    // Send security alert notification
    async sendSecurityAlertNotification(userId, alertData) {
        const title = 'Security Alert';
        const message = `Suspicious login attempt detected from ${alertData.location}.`;
        const data = {
            location: alertData.location,
            device: alertData.device,
            timestamp: alertData.timestamp,
            type: 'security_alert'
        };

        return await this.sendNotification(userId, 'security_alert', title, message, data);
    }

    // Send welcome notification
    async sendWelcomeNotification(userId, userData) {
        const title = 'Welcome to NydArt Advisor!';
        const message = `Welcome ${userData.username}! Your account has been created successfully.`;
        const data = {
            username: userData.username,
            type: 'welcome'
        };

        return await this.sendNotification(userId, 'welcome', title, message, data);
    }

    // Send artwork added notification
    async sendArtworkAddedNotification(userId, artworkData) {
        const title = 'Artwork Added';
        const message = `Your artwork "${artworkData.title}" has been added to your collection.`;
        const data = {
            artworkId: artworkData.id,
            artworkTitle: artworkData.title,
            type: 'artwork_added'
        };

        return await this.sendNotification(userId, 'artwork_added', title, message, data);
    }

    // Helper method to get notification titles
    getNotificationTitle(category) {
        const titles = {
            'welcome': 'Welcome to NydArt Advisor!',
            'analysis_complete': 'Analysis Complete!',
            'analysis_failed': 'Analysis Failed',
            'security_alert': 'Security Alert',
            'artwork_added': 'Artwork Added',
            'artwork_updated': 'Artwork Updated',
            'account_update': 'Account Updated',
            'subscription': 'Subscription Update',
            'system_alert': 'System Alert'
        };
        
        return titles[category] || 'Notification';
    }
}

module.exports = new NotificationService(); 