require('dotenv').config();
const axios = require('axios');

class SMSNotificationTester {
    constructor() {
        this.dbServiceUrl = process.env.DB_SERVICE_URL || 'http://localhost:5001/api';
        this.authServiceUrl = process.env.AUTH_SERVICE_URL || 'http://localhost:5002';
        this.notificationServiceUrl = process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:4003';
    }

    async testSMSNotifications() {
        console.log('🧪 Testing SMS Notifications for NydArt Advisor\n');

        try {
            // Step 1: Get users with phone numbers
            console.log('1. Fetching users with phone numbers...');
            const users = await this.getUsersWithPhoneNumbers();
            
            if (users.length === 0) {
                console.log('❌ No users with phone numbers found');
                console.log('\n📝 To test SMS notifications:');
                console.log('1. Register a new user with a phone number');
                console.log('2. Enable SMS notifications in Settings');
                console.log('3. Run this test again');
                return;
            }

            console.log(`✅ Found ${users.length} user(s) with phone numbers`);

            // Step 2: Test with each user
            for (const user of users) {
                await this.testUserSMSNotifications(user);
            }

        } catch (error) {
            console.error('❌ Error testing SMS notifications:', error.message);
        }
    }

    async getUsersWithPhoneNumbers() {
        try {
            const response = await axios.get(`${this.dbServiceUrl}/users`);
            const users = response.data;
            
            return users.filter(user => 
                user.phone && 
                user.phone.number && 
                user.notificationPreferences?.sms?.enabled
            );
        } catch (error) {
            console.error('Error fetching users:', error.message);
            return [];
        }
    }

    async testUserSMSNotifications(user) {
        console.log(`\n📱 Testing SMS for user: ${user.email}`);
        console.log(`   Phone: ${user.phone.number}`);
        console.log(`   SMS Enabled: ${user.notificationPreferences?.sms?.enabled}`);

        if (!user.notificationPreferences?.sms?.enabled) {
            console.log('   ⚠️ SMS notifications disabled for this user');
            return;
        }

        // Test different notification types
        const testCases = [
            {
                category: 'security_alert',
                title: 'Security Alert',
                message: 'New login detected on your account from a new device.',
                priority: 'high'
            },
            {
                category: 'analysis_complete',
                title: 'Analysis Complete',
                message: 'Your artwork "Sunset Landscape" has been analyzed successfully!',
                priority: 'normal'
            },
            {
                category: 'account_update',
                title: 'Account Updated',
                message: 'Your profile information has been updated successfully.',
                priority: 'low'
            }
        ];

        for (const testCase of testCases) {
            const categoryEnabled = user.notificationPreferences?.sms?.categories?.[testCase.category];
            
            if (categoryEnabled) {
                console.log(`   🔔 Testing ${testCase.category}...`);
                await this.sendTestNotification(user._id, testCase);
                
                // Wait 2 seconds between notifications
                await new Promise(resolve => setTimeout(resolve, 2000));
            } else {
                console.log(`   ⏭️ Skipping ${testCase.category} (disabled)`);
            }
        }
    }

    async sendTestNotification(userId, notificationData) {
        try {
            const response = await axios.post(`${this.notificationServiceUrl}/notify`, {
                userId,
                category: notificationData.category,
                title: notificationData.title,
                message: notificationData.message,
                data: {
                    priority: notificationData.priority,
                    test: true
                }
            });

            if (response.data.success) {
                console.log(`      ✅ ${notificationData.title} sent successfully`);
            } else {
                console.log(`      ❌ Failed to send ${notificationData.title}`);
            }
        } catch (error) {
            console.log(`      ❌ Error sending ${notificationData.title}: ${error.message}`);
        }
    }

    async createTestUser() {
        console.log('\n👤 Creating test user with phone number...');
        
        try {
            const testUser = {
                username: 'sms_test_user',
                email: 'sms_test@example.com',
                password: 'TestPassword123!',
                phone: {
                    number: process.env.TEST_PHONE_NUMBER,
                    countryCode: 'US'
                }
            };

            const response = await axios.post(`${this.authServiceUrl}/auth/register`, testUser);
            
            if (response.data.token) {
                console.log('✅ Test user created successfully');
                console.log(`   Email: ${testUser.email}`);
                console.log(`   Phone: ${testUser.phone.number}`);
                console.log('\n📝 Next steps:');
                console.log('1. Login with the test user');
                console.log('2. Go to Settings > Notifications');
                console.log('3. Enable SMS notifications');
                console.log('4. Run this test again');
            }
        } catch (error) {
            if (error.response?.status === 400 && error.response?.data?.message?.includes('already exists')) {
                console.log('ℹ️ Test user already exists');
            } else {
                console.error('❌ Error creating test user:', error.message);
            }
        }
    }

    async showInstructions() {
        console.log('\n📋 SMS Notification Testing Instructions:\n');
        
        console.log('1. 🏗️ Setup Twilio:');
        console.log('   - Create Twilio account at twilio.com');
        console.log('   - Get Account SID and Auth Token');
        console.log('   - Get a phone number');
        console.log('   - Add credentials to .env file');
        
        console.log('\n2. 📱 User Registration:');
        console.log('   - Register with phone number (+1234567890 format)');
        console.log('   - Phone number is optional during registration');
        
        console.log('\n3. ⚙️ Enable SMS Notifications:');
        console.log('   - Go to Dashboard > Settings > Notifications');
        console.log('   - Toggle "SMS Notifications" ON');
        console.log('   - Enter phone number if not already set');
        console.log('   - Select which categories to receive via SMS');
        
        console.log('\n4. 🧪 Test SMS:');
        console.log('   - Run: node test-sms-notifications.js');
        console.log('   - Check your phone for test messages');
        
        console.log('\n5. 🔔 Real Notifications:');
        console.log('   - SMS will be sent for:');
        console.log('     • Security alerts (new logins)');
        console.log('     • Analysis complete/failed');
        console.log('     • Account updates');
        console.log('     • Subscription changes');
    }
}

// Main execution
async function main() {
    const tester = new SMSNotificationTester();
    
    const args = process.argv.slice(2);
    
    if (args.includes('--help') || args.includes('-h')) {
        tester.showInstructions();
        return;
    }
    
    if (args.includes('--create-user')) {
        await tester.createTestUser();
        return;
    }
    
    await tester.testSMSNotifications();
}

main().catch(console.error);
