# 🔗 How to Get Your Slack Webhook URL

This guide will walk you through setting up a Slack webhook URL for your release notifications. There are two main approaches depending on your needs.

## 🚀 Quick Setup (Recommended)

### Method 1: Incoming Webhooks App (Easiest)

This is the fastest way to get started:

**Step 1: Install Incoming Webhooks App**
1. Go to your Slack workspace
2. Click on **Apps** in the left sidebar
3. Click **Browse App Directory** 
4. Search for **"Incoming Webhooks"**
5. Click **Add to Slack**

**Step 2: Configure the Webhook**
1. Choose the **channel** where you want notifications posted
2. Click **Add Incoming Webhooks Integration**
3. **Copy the Webhook URL** - it looks like:
   ```
   https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXXXXXX
   ```
4. **Customize (Optional):**
   - Change the webhook name to "Release Bot" or similar
   - Add a custom icon/emoji
   - Add a description

**Step 3: Test Your Webhook**
Test it with curl to make sure it works:
```bash
curl -X POST -H 'Content-type: application/json' \
--data '{"text":"🧪 Test message from Release Notifier!"}' \
YOUR_WEBHOOK_URL_HERE
```

## 🎯 Advanced Setup (More Control)

### Method 2: Custom Slack App (Recommended for Organizations)

This method gives you more control and better integration:

**Step 1: Create a New Slack App**
1. Go to [api.slack.com/apps](https://api.slack.com/apps)
2. Click **Create New App**
3. Choose **From scratch**
4. Enter app name: `Release Notifier`
5. Select your workspace
6. Click **Create App**

**Step 2: Enable Incoming Webhooks**
1. In your app settings, click **Incoming Webhooks** in the left sidebar
2. Toggle **Activate Incoming Webhooks** to **On**
3. Click **Add New Webhook to Workspace**
4. Select the channel for notifications
5. Click **Allow**

**Step 3: Get Your Webhook URL**
1. Copy the webhook URL from the **Webhook URLs for Your Workspace** section
2. It should look like:
   ```
   https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXXXXXX
   ```

**Step 4: Customize Your App (Optional)**
1. Go to **Basic Information** → **Display Information**
2. Add app name: `Release Notifier`
3. Add description: `Automated notifications for GitHub releases`
4. Add app icon (you can use 🚀 or 🔔 emoji)
5. Choose background color
6. Click **Save Changes**

**Step 5: Configure Permissions (Optional)**
For additional features, go to **OAuth & Permissions**:
- `chat:write` - Send messages
- `chat:write.customize` - Customize message appearance

## 🔒 Security Best Practices

### Protect Your Webhook URL
- ❌ **Never commit webhook URLs to code**
- ❌ **Don't share webhooks in chat or email**
- ✅ **Store in GitHub Secrets** (see below)
- ✅ **Use environment variables for local testing**
- ✅ **Rotate webhooks if compromised**

### GitHub Secrets Setup
1. Go to your repository → **Settings**
2. Click **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Name: `SLACK_WEBHOOK_URL`
5. Value: Your webhook URL
6. Click **Add secret**

### Organization Secrets (For Multiple Repos)
If you have many repositories:
1. Go to your GitHub organization settings
2. Click **Secrets and variables** → **Actions**
3. Click **New organization secret**
4. Name: `SLACK_WEBHOOK_URL`
5. Value: Your webhook URL
6. Select which repositories can access it

## 🧪 Testing Your Setup

### Quick Test (Recommended)

Use our built-in test script:

```bash
# Test with webhook URL as argument
node scripts/test-webhook.js https://hooks.slack.com/services/T.../B.../...

# Or set environment variable
SLACK_WEBHOOK_URL=your_webhook_url node scripts/test-webhook.js

# Or use npm script
npm run test-webhook https://hooks.slack.com/services/T.../B.../...
```

This will send a formatted test message and provide detailed feedback!

### Test with curl
```bash
# Replace YOUR_WEBHOOK_URL with your actual webhook
curl -X POST -H 'Content-type: application/json' \
--data '{
  "text": "🧪 Testing Release Notifier",
  "blocks": [
    {
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": "*Test Release:* v1.0.0\n*Status:* ✅ Webhook working!"
      }
    }
  ]
}' \
YOUR_WEBHOOK_URL
```

### Test with Node.js
Create a test file `test-webhook.js`:
```javascript
const https = require('https');

const webhookUrl = 'YOUR_WEBHOOK_URL_HERE';
const message = {
  text: '🧪 Testing Release Notifier from Node.js',
  blocks: [
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: '*Test Message*\nIf you see this, your webhook is working! 🎉'
      }
    }
  ]
};

const data = JSON.stringify(message);
const url = new URL(webhookUrl);

const options = {
  hostname: url.hostname,
  port: 443,
  path: url.pathname + url.search,
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(data)
  }
};

const req = https.request(options, (res) => {
  console.log(`Status: ${res.statusCode}`);
  if (res.statusCode === 200) {
    console.log('✅ Webhook test successful!');
  } else {
    console.log('❌ Webhook test failed');
  }
});

req.on('error', (error) => {
  console.error('❌ Error:', error.message);
});

req.write(data);
req.end();
```

Run it:
```bash
node test-webhook.js
```

## 🔧 Troubleshooting

### Common Issues

**❌ "Invalid payload" error**
- Check that your JSON is valid
- Ensure `Content-Type: application/json` header is set
- Verify the webhook URL is correct

**❌ "channel_not_found" error**
- The channel specified doesn't exist
- The bot doesn't have access to the channel
- Check channel name spelling (use # for public channels)

**❌ "No service" error**
- Webhook URL is incorrect or malformed
- Webhook has been deleted or deactivated
- Check if the app has been removed from the workspace

**❌ Messages not appearing**
- Check if the channel is archived
- Verify bot permissions
- Look for messages in the app's DM channel

**❌ Rate limiting**
- Slack limits to 1 message per second
- For high-volume notifications, implement queuing
- Check Slack's rate limiting documentation

### Getting Help

**Check Webhook Status:**
1. Go to your Slack app settings
2. Navigate to **Incoming Webhooks**
3. Verify the webhook is active and the URL is correct

**Slack API Documentation:**
- [Slack Incoming Webhooks](https://api.slack.com/messaging/webhooks)
- [Block Kit Builder](https://app.slack.com/block-kit-builder) - Design rich messages
- [Slack API Methods](https://api.slack.com/methods)

**Debug Your Messages:**
Use the [Block Kit Builder](https://app.slack.com/block-kit-builder) to test message formatting before sending.

## 🎨 Advanced Webhook Features

### Rich Message Formatting
```json
{
  "text": "Release Notification",
  "blocks": [
    {
      "type": "header",
      "text": {
        "type": "plain_text",
        "text": "🚀 New Release: v1.2.3"
      }
    },
    {
      "type": "section",
      "fields": [
        {
          "type": "mrkdwn",
          "text": "*Version:*\nv1.2.3"
        },
        {
          "type": "mrkdwn", 
          "text": "*Author:*\n@developer"
        }
      ]
    },
    {
      "type": "actions",
      "elements": [
        {
          "type": "button",
          "text": {
            "type": "plain_text",
            "text": "View Release"
          },
          "url": "https://github.com/org/repo/releases/tag/v1.2.3",
          "style": "primary"
        }
      ]
    }
  ]
}
```

### Channel-Specific Webhooks
You can create different webhooks for different channels:
- `#releases` - Major releases
- `#dev-updates` - Pre-releases and dev builds  
- `#critical-updates` - Security releases

### Mentioning Users
```json
{
  "text": "New release needs attention",
  "blocks": [
    {
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": "👋 <@U1234567890> <@U0987654321> - New release is ready for review!"
      }
    }
  ]
}
```

**To get user IDs:**
1. Right-click on a user in Slack
2. Select **View profile**
3. Click **More** → **Copy member ID**

## 📋 Quick Reference

### Webhook URL Format
```
https://hooks.slack.com/services/T{TEAM_ID}/B{BOT_ID}/{TOKEN}
```

### Basic Message Format
```json
{
  "text": "Your message here",
  "channel": "#optional-channel-override"
}
```

### Required Headers
```
Content-Type: application/json
```

### GitHub Secrets Names
- Repository: `SLACK_WEBHOOK_URL`
- Organization: `SLACK_WEBHOOK_URL`

---

**🎉 That's it!** You now have everything you need to set up Slack webhooks for your release notifications. If you run into any issues, check the troubleshooting section or refer to Slack's official documentation. 