# Bulk Email Sender

A React + TypeScript application for sending bulk emails using Nodemailer with Gmail integration. **Now deployable to Vercel!**

## Features

- 📧 Send emails to multiple recipients at once
- 🎯 Support for both plain text and HTML emails
- ✅ Individual email delivery tracking
- 🧪 Test email functionality
- 📊 Detailed sending results and statistics
- 🎨 Modern, responsive UI
- 🔒 Secure Gmail integration with app passwords
- ☁️ **Ready for Vercel deployment**

## Quick Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-username/bulk-email-sender)

For detailed deployment instructions, see [DEPLOYMENT.md](DEPLOYMENT.md).

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Gmail account with App Password enabled

## Gmail Setup

1. Enable 2-Factor Authentication on your Gmail account
2. Generate an App Password:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate a new app password for "Mail"
3. Use the generated app password in the environment variables

## Installation

1. Clone or download this project
2. Install dependencies for all parts:
   ```bash
   npm run install-all
   ```

## Configuration

Create a `server/.env` file with your Gmail credentials:
```env
# Gmail credentials
EMAIL_USER=your-email@gmail.com
EMAIL_APP_PASSWORD=your-app-password

# Server configuration
PORT=5000
NODE_ENV=development
```

**Important:** Never commit your actual credentials to version control. The `.env` file is already included in `.gitignore`.

## Running the Application

### Development Mode
Run both client and server simultaneously:
```bash
npm run dev
```

This will start:
- React client on http://localhost:3000
- Express server on http://localhost:5000

### Individual Components
Run client only:
```bash
npm run client
```

Run server only:
```bash
npm run server
```

## Usage

1. Open http://localhost:3000 in your browser
2. Fill in the email form:
   - **Recipients**: Enter multiple email addresses separated by commas, semicolons, or new lines
   - **Subject**: Email subject line
   - **Message**: Email content (supports plain text or HTML)
   - **Send as HTML**: Check this box if your message contains HTML
3. Click "Send Bulk Email" to send to all recipients
4. Use "Send Test Email" to test your configuration
5. View detailed results showing success/failure for each recipient

## API Endpoints

### POST /api/send-bulk-email
Send bulk emails to multiple recipients.

**Request Body:**
```json
{
  "to": ["email1@example.com", "email2@example.com"],
  "subject": "Your Subject",
  "message": "Your message content",
  "isHtml": false
}
```

### POST /api/test-email
Send a test email to verify configuration.

### GET /api/health
Check server health status.

## Project Structure

```
bulk-email-sender/
├── api/                    # Serverless functions (Vercel)
│   ├── index.ts           # Main API handler
│   ├── package.json       # API dependencies
│   └── tsconfig.json      # TypeScript config
├── client/                 # React TypeScript frontend
│   ├── public/
│   ├── src/
│   │   ├── App.tsx        # Main React component
│   │   ├── App.css        # Styles
│   │   └── index.tsx      # React entry point
│   └── package.json
├── server/                 # Express TypeScript backend (local dev)
│   ├── src/
│   │   └── index.ts       # Server with email functionality
│   ├── .env               # Environment variables
│   └── package.json
├── vercel.json            # Vercel deployment configuration
├── .env.example           # Environment variables template
├── DEPLOYMENT.md          # Vercel deployment guide
└── package.json           # Root package.json
```

## Features Explained

### Bulk Email Sending
- Supports multiple email formats (comma, semicolon, newline separated)
- Individual tracking for each email
- Rate limiting to avoid Gmail restrictions
- Detailed success/failure reporting

### Email Validation
- Client-side email format validation
- Server-side validation for security
- Error handling for invalid addresses

### Security
- Environment variables for credentials
- CORS protection
- Helmet.js for security headers
- Input validation and sanitization

## Troubleshooting

### Common Issues

1. **"Invalid credentials" error**
   - Verify your Gmail app password is correct
   - Ensure 2FA is enabled on your Gmail account

2. **"Connection refused" error**
   - Check if the server is running on port 5000
   - Verify firewall settings

3. **Emails not being sent**
   - Use the "Send Test Email" feature first
   - Check Gmail's sending limits
   - Verify recipient email addresses

### Gmail Limits
- Gmail has daily sending limits (500 emails/day for free accounts)
- Rate limiting is implemented to avoid hitting API limits
- Consider using Gmail Workspace for higher limits

## Development

### Adding New Features
1. Backend changes go in `server/src/index.ts`
2. Frontend changes go in `client/src/App.tsx`
3. Styling changes go in `client/src/App.css`

### Building for Production

**Local Build:**
```bash
cd client && npm run build
cd ../server && npm run build
```

**Vercel Deployment:**
```bash
vercel --prod
```

## Deployment Options

### 1. Vercel (Recommended)
- Serverless deployment
- Automatic HTTPS
- Global CDN
- See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed instructions

### 2. Traditional Hosting
- Use the `server/` directory for Express.js deployment
- Build the client and serve static files
- Configure environment variables on your hosting platform

## License

MIT License - feel free to use this project for your own purposes.