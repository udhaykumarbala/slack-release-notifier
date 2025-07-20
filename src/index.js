const core = require('@actions/core');
const github = require('@actions/github');
const https = require('https');

function getActionInputs() {
  return {
    slackWebhookUrl: core.getInput('slack-webhook-url'),
    channel: core.getInput('channel'),
    mentions: core.getInput('mentions'),
    notifyOnDrafts: core.getInput('notify-on-drafts') === 'true',
    actionItems: core.getInput('action-items'),
    customMessage: core.getInput('custom-message')
  };
}

function formatReleaseBody(body, releaseUrl) {
  if (!body) return 'No release notes provided.';
  
  // Truncate long release notes
  const maxLength = 500;
  if (body.length > maxLength) {
    return body.substring(0, maxLength) + '... <' + releaseUrl + '|Read more>';
  }
  
  return body;
}

function createSlackMessage(inputs, releaseData) {
  const { payload } = github.context;
  const release = payload.release;
  const repository = payload.repository;
  
  if (!release) {
    throw new Error('No release data found in GitHub context');
  }

  const repoName = repository.name;
  const isPrerelease = release.prerelease;
  const isDraft = release.draft;
  
  // Skip draft releases unless configured otherwise
  if (isDraft && !inputs.notifyOnDrafts) {
    core.info('Skipping draft release notification');
    return null;
  }
  
  const releaseType = isPrerelease ? '🚧 Pre-release' : '🚀 New Release';
  const emoji = isPrerelease ? ':construction:' : ':rocket:';
  
  const message = {
    text: `${releaseType} Alert: ${repoName} ${release.tag_name}`,
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
            text: `*Version:*\n${release.tag_name}`
          },
          {
            type: 'mrkdwn',
            text: `*Released by:*\n${release.author.login}`
          }
        ]
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*Release Notes:*\n${formatReleaseBody(release.body, release.html_url)}`
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
            url: release.html_url,
            style: 'primary'
          },
          {
            type: 'button',
            text: {
              type: 'plain_text',
              text: 'View Repository',
              emoji: true
            },
            url: repository.html_url
          }
        ]
      }
    ]
  };

  // Add custom channel if specified
  if (inputs.channel) {
    message.channel = inputs.channel;
  }

  // Add action items
  if (inputs.actionItems) {
    const items = inputs.actionItems.split(',').map(item => item.trim()).join(' | ');
    message.blocks.push({
      type: 'context',
      elements: [
        {
          type: 'mrkdwn',
          text: `📝 *Action Items:* ${items}`
        }
      ]
    });
  }

  // Add mentions if specified
  if (inputs.mentions) {
    const mentionsList = inputs.mentions.split(',').map(id => `<@${id.trim()}>`).join(' ');
    message.blocks.push({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `👥 *Team Notification:* ${mentionsList}`
      }
    });
  }

  return message;
}

function sendSlackMessage(webhookUrl, message) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(message);
    const url = new URL(webhookUrl);

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

async function run() {
  try {
    core.info('🚀 Starting Slack Release Notifier...');
    
    const inputs = getActionInputs();
    
    if (!inputs.slackWebhookUrl) {
      core.setFailed('slack-webhook-url input is required');
      return;
    }

    const message = createSlackMessage(inputs);
    
    if (!message) {
      core.info('No notification to send');
      core.setOutput('message-sent', 'false');
      return;
    }
    
    core.info('📝 Sending Slack notification...');
    const response = await sendSlackMessage(inputs.slackWebhookUrl, message);
    
    core.info('✅ Slack notification sent successfully!');
    core.setOutput('message-sent', 'true');
    core.setOutput('slack-response', response);
    
  } catch (error) {
    core.error('❌ Error sending Slack notification: ' + error.message);
    core.setFailed(error.message);
  }
}

// Run the action
run(); 