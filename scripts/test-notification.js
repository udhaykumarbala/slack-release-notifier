const https = require('https');
const path = require('path');

// Mock environment variables for testing
process.env.SLACK_WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL || 'https://hooks.slack.com/services/YOUR/WEBHOOK/URL';
process.env.RELEASE_TAG = 'v1.2.3';
process.env.RELEASE_NAME = 'Version 1.2.3 - Bug Fixes and Improvements';
process.env.RELEASE_BODY = 'This release includes important bug fixes and performance improvements:\n\n- Fixed memory leak in authentication module\n- Improved error handling for API timeouts\n- Updated dependencies for security patches\n- Added support for custom headers';
process.env.RELEASE_URL = 'https://github.com/your-org/your-sdk/releases/tag/v1.2.3';
process.env.REPOSITORY_NAME = 'your-org/your-sdk';
process.env.REPOSITORY_URL = 'https://github.com/your-org/your-sdk';
process.env.RELEASE_AUTHOR = 'sdk-maintainer';
process.env.IS_PRERELEASE = 'false';
process.env.IS_DRAFT = 'false';

console.log('🧪 Testing Slack Release Notification');
console.log('=====================================');
console.log('');

// Check if webhook URL is configured
if (!process.env.SLACK_WEBHOOK_URL || process.env.SLACK_WEBHOOK_URL.includes('YOUR/WEBHOOK/URL')) {
  console.log('⚠️  Warning: SLACK_WEBHOOK_URL is not properly configured');
  console.log('   Please set the SLACK_WEBHOOK_URL environment variable with your actual Slack webhook URL');
  console.log('   or add it to your .env file (not recommended for production)');
  console.log('');
}

console.log('Test Parameters:');
console.log('- Repository:', process.env.REPOSITORY_NAME);
console.log('- Release Tag:', process.env.RELEASE_TAG);
console.log('- Release Author:', process.env.RELEASE_AUTHOR);
console.log('- Is Prerelease:', process.env.IS_PRERELEASE);
console.log('');

// Import and run the main notification script
try {
  require('./send-slack-notification.js');
} catch (error) {
  console.error('❌ Test failed:', error.message);
  console.log('');
  console.log('Troubleshooting:');
  console.log('1. Make sure you have run: npm install');
  console.log('2. Ensure SLACK_WEBHOOK_URL is properly set');
  console.log('3. Check that config/slack-config.json exists and is valid JSON');
  process.exit(1);
} 