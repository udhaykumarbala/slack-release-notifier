# 🚀 Slack Release Notifications

Automated Slack notifications for GitHub releases - perfect for SDK teams to announce new releases and remind team members about documentation updates.

![Release Notification Example](https://img.shields.io/badge/Slack-Notification-green?style=flat-square&logo=slack)

## ✨ Features

- 🔔 Automatic Slack notifications when releases are published
- 📱 Rich message formatting with action buttons
- 🎯 Customizable team mentions and channels
- 🚧 Support for pre-releases and draft releases
- 📝 Action item reminders for documentation updates
- ⚡ Easy to integrate across multiple SDK repositories
- 🧪 Built-in testing capabilities

## 🎯 Perfect For

- **SDK Teams**: Announce new SDK versions to stakeholders
- **Documentation Teams**: Get notified to update docs and changelogs  
- **DevRel Teams**: Stay informed about releases for blog posts and announcements
- **Support Teams**: Know when new versions are available

## 📋 What You Get

When a release is published, your team receives a beautifully formatted Slack message containing:

- 🏷️ Release version and type (release/pre-release)
- 👤 Who published the release
- 📄 Release notes (auto-truncated with "read more" link)
- 🔗 Quick action buttons to view release and repository
- 📝 Customizable action item reminders
- 👥 Optional team member mentions

## 🚀 Quick Start

**Choose your preferred installation method:**

### Option 1: GitHub Actions Marketplace (Recommended) ⭐

The easiest way! Just add this to your workflow:

```yaml
name: Release Notifications

on:
  release:
    types: [published]

jobs:
  notify-slack:
    runs-on: ubuntu-latest
    steps:
      - name: Send Slack Notification
        uses: your-org/slack-release-notifications@v1
        with:
          slack-webhook-url: ${{ secrets.SLACK_WEBHOOK_URL }}
```

**That's it!** Add your `SLACK_WEBHOOK_URL` to repository secrets and you're done.

### Option 2: NPM Package 📦

Install globally and use in any project:

```bash
# Install globally
npm install -g slack-release-notifications

# Or add to your project
npm install --save-dev slack-release-notifications
```

Then use in your GitHub Actions:

```yaml
- name: Install notifier
  run: npm install -g slack-release-notifications
  
- name: Send notification
  run: slack-release-notifications
  env:
    SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK_URL }}
```

### Option 3: Template Repository 🎯

Use GitHub's template feature:

1. Click **"Use this template"** on this repository
2. Create your new repository
3. Add your `SLACK_WEBHOOK_URL` secret
4. Customize `config/slack-config.json` as needed

### Option 4: Manual Copy (Legacy)

For maximum customization, copy the files manually:

```bash
# Required files
.github/workflows/release-notification.yml
scripts/send-slack-notification.js
config/slack-config.json
package.json
```

## 🔧 Setup (All Methods)

### 1. Get Your Slack Webhook URL

📖 **[Complete Slack Webhook Setup Guide](docs/slack-webhook-setup.md)** - Detailed instructions with troubleshooting

**Quick Setup:**
1. Go to your Slack workspace settings
2. Navigate to **Apps** → **Custom Integrations** → **Incoming Webhooks**
3. Create a new webhook for your desired channel
4. Copy the webhook URL

### 2. Add GitHub Secret

1. Go to your repository → **Settings** → **Secrets and variables** → **Actions**
2. Click **New repository secret**
3. Name: `SLACK_WEBHOOK_URL`
4. Value: Your webhook URL from step 1

### 3. Test Your Webhook (Optional but Recommended)

```bash
# Quick webhook test
node scripts/test-webhook.js YOUR_WEBHOOK_URL

# Or use npm
npm run test-webhook YOUR_WEBHOOK_URL
```

## 🔧 Configuration Options

### GitHub Action Inputs (Marketplace Version)

| Input | Required | Description | Default |
|-------|----------|-------------|---------|
| `slack-webhook-url` | ✅ | Your Slack webhook URL | - |
| `channel` | ❌ | Slack channel to post to | Webhook default |
| `mentions` | ❌ | Comma-separated Slack user IDs | - |
| `notify-on-drafts` | ❌ | Send notifications for drafts | `false` |
| `action-items` | ❌ | Comma-separated action items | Default list |

**Advanced Example:**
```yaml
  - name: Send Slack Notification
    uses: your-org/slack-release-notifications@v1
  with:
    slack-webhook-url: ${{ secrets.SLACK_WEBHOOK_URL }}
    channel: '#releases'
    mentions: 'U1234567890,U0987654321'
    notify-on-drafts: 'true'
    action-items: 'Update docs,Announce,Test,Update changelog'
```

### Config File Options (Template/Manual Copy)

| Option | Type | Description | Default |
|--------|------|-------------|---------|
| `channel` | string | Slack channel to post to (optional) | Webhook default |
| `mentions` | array | Slack user IDs to mention | `[]` |
| `notifyOnDrafts` | boolean | Send notifications for draft releases | `false` |
| `actionItems` | array | Custom action item reminders | See example |

### Getting Slack User IDs

To mention team members, you need their Slack User IDs:

1. In Slack, click on a user's profile
2. Click **More** → **Copy member ID**
3. Add the ID to the `mentions` array in your config

## 📱 Message Format

The Slack message includes:

```
🚀 New Release: your-sdk
Version: v1.2.3          Released by: @developer
Release Notes: [Truncated notes with "Read more" link]
[View Release] [View Repository] <- Action buttons
📝 Action Items: Update documentation | Announce to stakeholders | Test integration
👥 Team Notification: @teamlead @devrel
```

## 🧪 Testing

### Local Testing

1. Copy `example.env` to `.env` (don't commit this!)
2. Set your `SLACK_WEBHOOK_URL`
3. Run: `npm run test`

### Test in GitHub Actions

1. Create a test release in your repository
2. Check the Actions tab to see if the workflow ran
3. Verify the Slack message was posted

## 📦 Publishing to Marketplaces

### GitHub Actions Marketplace

To publish this action to the GitHub marketplace:

1. **Create a release** with a semantic version (e.g., `v1.0.0`)
2. **Tag format**: Use `vX.Y.Z` format for releases  
3. **Build first**: Run `npm run build` to create `dist/index.js`
4. **Commit dist/**: Make sure to commit the built files
5. **Release**: GitHub will automatically list it in the marketplace

### NPM Registry

To publish the NPM package:

```bash
# Build the package
npm run build

# Login to npm (if not already)
npm login

# Publish to npm
npm publish
```

## 🔄 Deployment to Multiple Repositories

**With Marketplace Action (Recommended):**
Just add the workflow file to each repository - no copying needed!

**Other Options:**

### Option 1: Automation Script
```bash
#!/bin/bash
# Add marketplace action to all repos
for repo in sdk-js sdk-python sdk-go; do
  gh repo clone your-org/$repo
  cd $repo
  mkdir -p .github/workflows
  cat > .github/workflows/release-notifications.yml << 'EOF'
name: Release Notifications
on:
  release:
    types: [published]
jobs:
  notify-slack:
    runs-on: ubuntu-latest
    steps:
             - uses: your-org/slack-release-notifications@v1
        with:
          slack-webhook-url: \${{ secrets.SLACK_WEBHOOK_URL }}
EOF
  git add .
  git commit -m "Add Slack release notifications"
  git push
  cd ..
done
```

### Option 2: GitHub Template Repository
1. Mark this repository as a template
2. Use GitHub's template feature when creating new SDK repos

## 📊 Workflow Triggers

The GitHub Action triggers on:
- ✅ `release.published` - When a release is published
- ✅ `release.created` - When a release is created

It does NOT trigger on:
- ❌ `release.drafted` - When a release is saved as draft (configurable)
- ❌ `release.edited` - When release details are modified
- ❌ `release.deleted` - When a release is deleted

## 🔧 Customization

### Custom Message Templates

Modify `scripts/send-slack-notification.js` to customize the message format:

```javascript
// Example: Add custom fields
{
  type: 'section',
  fields: [
    {
      type: 'mrkdwn',
      text: `*Priority:*\n${isPrerelease ? 'Medium' : 'High'}`
    }
  ]
}
```

### Different Notification Channels

You can set up different channels for different types of releases:

```javascript
// Example: Route pre-releases to different channel
const channel = isPrerelease ? '#pre-releases' : '#releases';
```

## 🐛 Troubleshooting

### Common Issues

**❌ Workflow doesn't trigger**
- Check that the workflow file is in `.github/workflows/`
- Verify the YAML syntax is correct
- Ensure you've pushed the workflow to the default branch

**❌ Slack message not sent**
- Verify `SLACK_WEBHOOK_URL` is set in repository secrets
- Test the webhook URL manually with curl
- Check the Actions logs for error messages
- 📖 See [Slack Webhook Setup Guide](docs/slack-webhook-setup.md) for detailed troubleshooting

**❌ Wrong channel or formatting**
- Verify your `config/slack-config.json` is valid JSON
- Check that mentioned user IDs are correct
- Test with `npm run test` locally

**❌ Node.js errors**
- Ensure Node.js version is 16+ in the workflow
- Check that all required files are present
- Verify `package.json` structure

### Debug Mode

Enable debug logging by adding to your workflow:

```yaml
env:
  DEBUG: true
  SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK_URL }}
```

## 🤝 Contributing

1. Fork this repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

MIT License - feel free to use this in your projects!

## 📚 Documentation

- 🚀 **[Main Setup Guide](README.md)** - You're reading it!
- 🔗 **[Slack Webhook Setup](docs/slack-webhook-setup.md)** - Detailed webhook configuration guide
- 📝 **[Configuration Examples](examples/)** - Sample workflow files

## 🆘 Support

- 📖 Check this README for common solutions
- 🔗 [Slack Webhook Issues](docs/slack-webhook-setup.md#troubleshooting) - Webhook-specific troubleshooting
- 🐛 [Open an issue](https://github.com/your-org/slack-releases/issues) for bugs
- 💡 [Request features](https://github.com/your-org/slack-releases/issues) via GitHub issues
- 📧 Contact the SDK team for internal support

---

**Happy releasing! 🎉** 