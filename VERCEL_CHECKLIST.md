# Vercel Deployment Checklist

## Pre-Deployment Checklist

### ✅ Files Created/Modified
- [x] `vercel.json` - Vercel configuration
- [x] `api/index.ts` - Serverless function handler
- [x] `api/package.json` - API dependencies
- [x] `api/tsconfig.json` - TypeScript config for API
- [x] `.env.example` - Environment variables template
- [x] `DEPLOYMENT.md` - Detailed deployment guide
- [x] Updated `README.md` with deployment info
- [x] Updated `.gitignore` for Vercel files
- [x] Updated root `package.json` with build scripts
- [x] Removed proxy from `client/package.json`
- [x] Updated `client/src/App.tsx` for production API calls

### ✅ Configuration Verified
- [x] Vercel routing configured for API and static files
- [x] Environment variables defined in vercel.json
- [x] Serverless function timeout set to 30 seconds
- [x] Client build configuration updated
- [x] TypeScript configurations in place

## Deployment Steps

### 1. Environment Setup
- [ ] Gmail account with 2FA enabled
- [ ] App-specific password generated
- [ ] Vercel account created

### 2. Deploy to Vercel
Choose one method:

**Option A: Vercel CLI**
```bash
npm install -g vercel
vercel login
vercel --prod
```

**Option B: GitHub Integration**
- Push to GitHub
- Connect repository to Vercel
- Import project

### 3. Configure Environment Variables
In Vercel dashboard, add:
- `EMAIL_USER`: Your Gmail address
- `EMAIL_APP_PASSWORD`: Your app-specific password

### 4. Test Deployment
- [ ] Visit deployed URL
- [ ] Test "Send Test Email" functionality
- [ ] Send a bulk email to verify full functionality

## Troubleshooting

### Build Issues
- Check all dependencies are listed in package.json files
- Verify TypeScript configurations
- Ensure no syntax errors in code

### Runtime Issues
- Verify environment variables in Vercel dashboard
- Check function logs in Vercel dashboard
- Test Gmail credentials locally first

### Email Issues
- Confirm Gmail app password is correct
- Check Gmail sending limits
- Verify recipient email addresses

## Success Indicators
- ✅ Build completes without errors
- ✅ Deployment shows as successful in Vercel
- ✅ Test email sends successfully
- ✅ Bulk email functionality works
- ✅ No console errors in browser

## Post-Deployment
- [ ] Update any documentation with live URL
- [ ] Test with real email addresses
- [ ] Monitor function usage and performance
- [ ] Set up custom domain (optional)