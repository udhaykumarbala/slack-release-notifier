#!/usr/bin/env node

const https = require('https');

/**
 * Test script for Slack webhook validation
 * Usage: node test-webhook.js YOUR_WEBHOOK_URL
 */

function showUsage() {
  console.log('🔗 Slack Webhook Tester');
  console.log('======================');
  console.log('');
  console.log('Usage:');
  console.log('  node test-webhook.js YOUR_WEBHOOK_URL');
  console.log('  SLACK_WEBHOOK_URL=your_url node test-webhook.js');
  console.log('');
  console.log('Examples:');
  console.log('  node test-webhook.js https://hooks.slack.com/services/T.../B.../...');
  console.log('  SLACK_WEBHOOK_URL=https://hooks.slack.com/... node test-webhook.js');
  console.log('');
  console.log('📖 For setup instructions, see: docs/slack-webhook-setup.md');
  process.exit(1);
}

function validateWebhookUrl(url) {
  if (!url) return false;
  if (!url.startsWith('https://hooks.slack.com/services/')) {
    console.log('❌ Invalid webhook URL format');
    console.log('   Expected: https://hooks.slack.com/services/T.../B.../...');
    console.log('   Received:', url);
    return false;
  }
  return true;
}

function createTestMessage() {
  return {
    text: '🧪 Webhook Test from Release Notifier',
    blocks: [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: '🧪 Webhook Test Message',
          emoji: true
        }
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: '*Status:* ✅ Your Slack webhook is working correctly!\n*Test Time:* ' + new Date().toISOString()
        }
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: '*Next Steps:*\n• Add `SLACK_WEBHOOK_URL` to your GitHub repository secrets\n• Create a release to test the full workflow\n• Customize your notification settings'
        }
      },
      {
        type: 'context',
        elements: [
          {
            type: 'mrkdwn',
            text: '🚀 Sent from Slack Release Notifier test script'
          }
        ]
      }
    ]
  };
}

function sendTestMessage(webhookUrl) {
  return new Promise((resolve, reject) => {
    const message = createTestMessage();
    const data = JSON.stringify(message);
    const url = new URL(webhookUrl);

    const options = {
      hostname: url.hostname,
      port: 443,
      path: url.pathname + url.search,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data),
        'User-Agent': 'Slack-Release-Notifier-Test/1.0'
      }
    };

    console.log('📤 Sending test message to Slack...');
    console.log(`🎯 Target: ${url.hostname}${url.pathname}`);

    const req = https.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode === 200) {
          if (responseData.trim() === 'ok') {
            resolve({
              success: true,
              statusCode: res.statusCode,
              response: responseData
            });
          } else {
            resolve({
              success: false,
              statusCode: res.statusCode,
              response: responseData,
              error: 'Unexpected response from Slack'
            });
          }
        } else {
          resolve({
            success: false,
            statusCode: res.statusCode,
            response: responseData,
            error: `HTTP ${res.statusCode}`
          });
        }
      });
    });

    req.on('error', (error) => {
      reject({
        success: false,
        error: error.message,
        code: error.code
      });
    });

    // Set a timeout
    req.setTimeout(10000, () => {
      req.abort();
      reject({
        success: false,
        error: 'Request timeout (10 seconds)',
        code: 'TIMEOUT'
      });
    });

    req.write(data);
    req.end();
  });
}

async function main() {
  console.log('🔗 Slack Webhook Tester');
  console.log('========================');
  console.log('');

  // Get webhook URL from command line or environment
  let webhookUrl = process.argv[2] || process.env.SLACK_WEBHOOK_URL;

  if (!webhookUrl) {
    console.log('❌ No webhook URL provided');
    console.log('');
    showUsage();
  }

  if (!validateWebhookUrl(webhookUrl)) {
    console.log('');
    console.log('📖 Need help setting up a webhook?');
    console.log('   See: docs/slack-webhook-setup.md');
    process.exit(1);
  }

  console.log('🔍 Testing webhook URL...');
  console.log(`📍 URL: ${webhookUrl.substring(0, 50)}...`);
  console.log('');

  try {
    const result = await sendTestMessage(webhookUrl);
    
    if (result.success) {
      console.log('✅ SUCCESS! Webhook test passed');
      console.log(`📊 Status Code: ${result.statusCode}`);
      console.log(`📝 Response: ${result.response}`);
      console.log('');
      console.log('🎉 Your webhook is working correctly!');
      console.log('');
      console.log('📋 Next Steps:');
      console.log('   1. Add SLACK_WEBHOOK_URL to your GitHub repository secrets');
      console.log('   2. Set up the release notification workflow');
      console.log('   3. Create a test release to verify end-to-end functionality');
      console.log('');
      console.log('📖 Full setup guide: README.md');
    } else {
      console.log('❌ FAILED! Webhook test failed');
      console.log(`📊 Status Code: ${result.statusCode}`);
      console.log(`📝 Response: ${result.response}`);
      console.log(`❌ Error: ${result.error}`);
      console.log('');
      console.log('🔧 Troubleshooting:');
      
      if (result.statusCode === 404) {
        console.log('   • Webhook URL might be incorrect or expired');
        console.log('   • Check if the webhook still exists in your Slack app settings');
      } else if (result.statusCode === 403) {
        console.log('   • The webhook might not have permission to post');
        console.log('   • Check if the Slack app is still installed in your workspace');
      } else if (result.statusCode >= 400) {
        console.log('   • There might be an issue with the message format');
        console.log('   • Check Slack\'s webhook documentation for requirements');
      }
      
      console.log('');
      console.log('📖 Full troubleshooting guide: docs/slack-webhook-setup.md#troubleshooting');
      process.exit(1);
    }
  } catch (error) {
    console.log('❌ ERROR! Failed to send test message');
    console.log(`❌ Error: ${error.error}`);
    
    if (error.code) {
      console.log(`🔧 Code: ${error.code}`);
      
      if (error.code === 'ENOTFOUND') {
        console.log('   • Check your internet connection');
        console.log('   • Verify the webhook URL is correct');
      } else if (error.code === 'TIMEOUT') {
        console.log('   • Slack might be experiencing issues');
        console.log('   • Try again in a few minutes');
      }
    }
    
    console.log('');
    console.log('📖 For help: docs/slack-webhook-setup.md#troubleshooting');
    process.exit(1);
  }
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled error:', reason);
  process.exit(1);
});

// Run the test
main(); 