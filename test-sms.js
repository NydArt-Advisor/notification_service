require('dotenv').config();
const twilioService = require('./src/services/twilioService');

async function testSMS() {
    console.log('🧪 Testing Twilio SMS Service...\n');

    // Check if Twilio is initialized
    if (!twilioService.isInitialized) {
        console.log('❌ Twilio service not initialized. Please check your environment variables:');
        console.log('   - TWILIO_ACCOUNT_SID');
        console.log('   - TWILIO_AUTH_TOKEN');
        console.log('   - TWILIO_PHONE_NUMBER');
        return;
    }

    console.log('✅ Twilio service initialized successfully');

    // Get account information
    console.log('\n📊 Account Information:');
    const accountInfo = await twilioService.getAccountInfo();
    if (accountInfo) {
        console.log(`   Account: ${accountInfo.accountName}`);
        console.log(`   Status: ${accountInfo.status}`);
        console.log(`   Balance: ${accountInfo.balance} ${accountInfo.currency}`);
    }

    // Test SMS functionality
    const testPhoneNumber = process.env.TEST_PHONE_NUMBER;
    if (!testPhoneNumber) {
        console.log('\n❌ TEST_PHONE_NUMBER not set in environment variables');
        console.log('   Please add TEST_PHONE_NUMBER=+1234567890 to your .env file');
        return;
    }

    console.log(`\n📱 Testing SMS to: ${testPhoneNumber}`);
    
    // Test basic SMS
    console.log('\n1. Testing basic SMS...');
    const basicResult = await twilioService.testSMS(testPhoneNumber);
    
    if (basicResult.success) {
        console.log('✅ Basic SMS test passed');
    } else {
        console.log('❌ Basic SMS test failed:', basicResult.error);
    }

    // Test notification SMS
    console.log('\n2. Testing notification SMS...');
    const notificationResult = await twilioService.sendNotificationSMS(
        testPhoneNumber,
        'Test Notification',
        'This is a test notification from NydArt Advisor',
        { priority: 'normal' }
    );

    if (notificationResult.success) {
        console.log('✅ Notification SMS test passed');
    } else {
        console.log('❌ Notification SMS test failed:', notificationResult.error);
    }

    // Test urgent notification
    console.log('\n3. Testing urgent notification...');
    const urgentResult = await twilioService.sendNotificationSMS(
        testPhoneNumber,
        'Security Alert',
        'New login detected on your account',
        { priority: 'urgent' }
    );

    if (urgentResult.success) {
        console.log('✅ Urgent notification test passed');
    } else {
        console.log('❌ Urgent notification test failed:', urgentResult.error);
    }

    console.log('\n🎉 SMS testing completed!');
}

testSMS().catch(console.error);
