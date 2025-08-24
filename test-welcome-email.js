const fetch = require('node-fetch');

async function testWelcomeEmail() {
    console.log('🧪 Testing Welcome Email Functionality...\n');

    try {
        // Test welcome email endpoint
        const response = await fetch('http://localhost:4003/welcome', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: 'test@example.com',
                username: 'testuser',
                loginLink: 'http://localhost:3000/login'
            })
        });

        const result = await response.json();

        if (response.ok) {
            console.log('✅ Welcome email test successful!');
            console.log('📧 Response:', result);
            
            if (result.method === 'mock') {
                console.log('\n📝 Note: This is a mock response. To send real emails:');
                console.log('   1. Configure your email service in .env file');
                console.log('   2. Restart the notification service');
                console.log('   3. Run this test again');
            } else {
                console.log('\n🎉 Real email sent successfully!');
                console.log(`📧 Method: ${result.method}`);
                console.log(`📧 Message ID: ${result.messageId}`);
            }
        } else {
            console.log('❌ Welcome email test failed!');
            console.log('📧 Error:', result);
        }

    } catch (error) {
        console.log('❌ Test failed with error:', error.message);
        console.log('\n💡 Make sure the notification service is running on port 4003');
    }
}

// Run the test
testWelcomeEmail(); 