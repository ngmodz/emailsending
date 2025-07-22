# Vercel Deployment Guide

This guide will help you deploy the Bulk Email Sender application to Vercel.

## Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **Gmail Account**: For sending emails
3. **App-Specific Password**: Required for Gmail SMTP

## Step 1: Prepare Gmail Configuration

1. Enable 2-factor authentication on your Gmail account
2. Generate an app-specific password:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate a new app password for "Mail"
   - Save this password (you'll need it for environment variables)

## Step 2: Deploy to Vercel

### Option A: Deploy via Vercel CLI

1. Install Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Login to Vercel:
   ```bash
   vercel login
   ```

3. Deploy from project root:
   ```bash
   vercel
   ```

### Option B: Deploy via GitHub Integration

1. Push your code to GitHub
2. Connect your GitHub repository to Vercel
3. Import the project in Vercel dashboard

## Step 3: Configure Environment Variables

In your Vercel project dashboard, add these environment variables:

- `EMAIL_USER`: Your Gmail address (e.g., `your-email@gmail.com`)
- `EMAIL_APP_PASSWORD`: The app-specific password you generated

## Step 4: Verify Deployment

1. Visit your deployed application URL
2. Click "Send Test Email" to verify email configuration
3. Try sending a bulk email to test functionality

## Project Structure

```
├── api/                    # Serverless functions
│   ├── index.ts           # Main API handler
│   ├── package.json       # API dependencies
│   └── tsconfig.json      # TypeScript config
├── client/                # React frontend
│   ├── src/
│   ├── package.json
│   └── tsconfig.json
├── server/                # Original Express server (for local dev)
├── vercel.json            # Vercel configuration
├── .env.example           # Environment variables template
└── DEPLOYMENT.md          # This file
```

## Troubleshooting

### Common Issues

1. **Email sending fails**: 
   - Verify Gmail app-specific password
   - Check environment variables in Vercel dashboard

2. **Build fails**:
   - Ensure all dependencies are listed in package.json files
   - Check TypeScript configuration

3. **API routes not working**:
   - Verify vercel.json routing configuration
   - Check function deployment in Vercel dashboard

### Local Development

For local development, you can still use the original structure:

```bash
npm run dev
```

This will run both client and server locally with the original Express setup.

## Security Notes

- Never commit `.env` files to version control
- Use Vercel's environment variables for production secrets
- The app uses Gmail's SMTP with TLS encryption
- CORS is configured to allow cross-origin requests

## Performance Considerations

- Serverless functions have a 30-second timeout limit
- Large email batches may need to be split into smaller chunks
- Consider implementing rate limiting for production use