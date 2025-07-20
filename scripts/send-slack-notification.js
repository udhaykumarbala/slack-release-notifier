const https = require('https');
const fs = require('fs');
const path = require('path');

// Load configuration
const configPath = path.join(__dirname, '..', 'config', 'slack-config.json');
let config = {};

if (fs.existsSync(configPath)) {
  config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
}

// Environment variables from GitHub Actions
const {
  SLACK_WEBHOOK_URL,
  RELEASE_TAG,
  RELEASE_NAME,
  RELEASE_BODY,
  RELEASE_URL,
  REPOSITORY_NAME,
  REPOSITORY_URL,
  RELEASE_AUTHOR,
  IS_PRERELEASE,
  IS_DRAFT
} = process.env;

function formatReleaseBody(body) {
  if (!body) return 'No release notes provided.';
  
  // Truncate long release notes
  const maxLength = 500;
  if (body.length > maxLength) {
    return body.substring(0, maxLength) + '... <' + RELEASE_URL + '|Read more>';
  }
  
  return body;
}

function createSlackMessage() {
  const repoName = REPOSITORY_NAME.split('/')[1]; // Extract repo name from owner/repo
  const isPrerelease = IS_PRERELEASE === 'true';
  const isDraft = IS_DRAFT === 'true';
  
  // Skip draft releases unless configured otherwise
  if (isDraft && !config.notifyOnDrafts) {
    console.log('Skipping draft release notification');
    return null;
  }
  
  const releaseType = isPrerelease ? '🚧 Pre-release' : '🚀 New Release';
  const emoji = isPrerelease ? ':construction:' : ':rocket:';
  
  const message = {
    text: `${releaseType} Alert: ${repoName} ${RELEASE_TAG}`,
    blocks: [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: `${emoji} ${releaseType}: ${repoName}`,
          emoji: true
        }
      },
      {
        type: 'section',
        fields: [
          {
            type: 'mrkdwn',
            text: `*Version:*\n${RELEASE_TAG}`
          },
          {
            type: 'mrkdwn',
            text: `*Released by:*\n${RELEASE_AUTHOR}`
          }
        ]
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*Release Notes:*\n${formatReleaseBody(RELEASE_BODY)}`
        }
      },
      {
        type: 'actions',
        elements: [
          {
            type: 'button',
            text: {
              type: 'plain_text',
              text: 'View Release',
              emoji: true
            },
            url: RELEASE_URL,
            style: 'primary'
          },
          {
            type: 'button',
            text: {
              type: 'plain_text',
              text: 'View Repository',
              emoji: true
            },
            url: REPOSITORY_URL
          }
        ]
      },
      {
        type: 'context',
        elements: [
          {
            type: 'mrkdwn',
            text: `📝 *Action Items:* Update documentation | Announce to stakeholders | Test integration`
          }
        ]
      }
    ]
  };

  // Add custom channel if specified in config
  if (config.channel) {
    message.channel = config.channel;
  }

  // Add mentions if specified in config
  if (config.mentions && config.mentions.length > 0) {
    const mentionsText = config.mentions.map(mention => `<@${mention}>`).join(' ');
    message.blocks.push({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `👥 *Team Notification:* ${mentionsText}`
      }
    });
  }

  return message;
}

function sendSlackMessage(message) {
  return new Promise((resolve, reject) => {
    if (!SLACK_WEBHOOK_URL) {
      reject(new Error('SLACK_WEBHOOK_URL environment variable is not set'));
      return;
    }

    const data = JSON.stringify(message);
    const url = new URL(SLACK_WEBHOOK_URL);

    const options = {
      hostname: url.hostname,
      port: url.port || 443,
      path: url.pathname + url.search,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data)
      }
    };

    const req = https.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          console.log('✅ Slack notification sent successfully');
          resolve(responseData);
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${responseData}`));
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.write(data);
    req.end();
  });
}

async function main() {
  try {
    console.log(`📢 Preparing Slack notification for release ${RELEASE_TAG}...`);
    
    const message = createSlackMessage();
    
    if (!message) {
      console.log('No notification to send');
      return;
    }
    
    await sendSlackMessage(message);
    console.log('🎉 Release notification sent to Slack!');
    
  } catch (error) {
    console.error('❌ Error sending Slack notification:', error.message);
    process.exit(1);
  }
}

// Run the script
main(); 