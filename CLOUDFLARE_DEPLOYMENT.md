# Deploying to Cloudflare Pages

This guide will help you deploy your GLO Members Matcher to Cloudflare Pages.

## Prerequisites

1. A Cloudflare account (free tier available)
2. Your GitHub repository connected to Cloudflare

## Step 1: Set up Cloudflare Pages

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Navigate to **Pages** in the sidebar
3. Click **Create a project**
4. Choose **Connect to Git**
5. Select your GitHub repository (`matching-mvp`)
6. Configure the build settings:
   - **Project name**: `glo-members-matcher`
   - **Production branch**: `main`
   - **Framework preset**: `None`
   - **Build command**: Leave empty
   - **Build output directory**: `.` (root directory)
   - **Root directory**: Leave empty

## Step 2: Configure Environment Variables

In your Cloudflare Pages project settings, add these environment variables:

1. Go to your project settings in Cloudflare Pages
2. Navigate to **Environment variables**
3. Add the following variables:
   - `NODE_ENV`: `production`

## Step 3: Set up GitHub Secrets (for automated deployment)

If you want to use the GitHub Actions workflow for automated deployment:

1. Go to your GitHub repository settings
2. Navigate to **Secrets and variables** → **Actions**
3. Add these secrets:
   - `CLOUDFLARE_API_TOKEN`: Your Cloudflare API token
   - `CLOUDFLARE_ACCOUNT_ID`: Your Cloudflare account ID

### Getting Cloudflare API Token:
1. Go to [Cloudflare API Tokens](https://dash.cloudflare.com/profile/api-tokens)
2. Click **Create Token**
3. Use the **Custom token** template
4. Set permissions:
   - **Zone**: Include → All zones
   - **Zone Resources**: Include → All zones
   - **Permissions**: Zone → Zone:Edit, Zone:Read
5. Set **Account Resources**: Include → All accounts
6. Set **Account Permissions**: Account → Account:Read
7. Create the token and copy it

### Getting Account ID:
1. Go to your Cloudflare dashboard
2. Look at the URL: `https://dash.cloudflare.com/<account-id>`
3. Copy the account ID from the URL

## Step 4: Deploy

### Option A: Manual Deployment (Recommended for first time)
1. Push your code to the `main` branch
2. Cloudflare Pages will automatically build and deploy
3. Your site will be available at: `https://glo-members-matcher.pages.dev`

### Option B: Automated Deployment via GitHub Actions
1. Ensure you've set up the GitHub secrets
2. Push to `main` branch
3. The GitHub Action will automatically deploy to Cloudflare Pages

## Step 5: Custom Domain (Optional)

1. In your Cloudflare Pages project settings
2. Go to **Custom domains**
3. Add your custom domain
4. Follow the DNS configuration instructions

## Important Notes

- Your app is now deployed as a static site on Cloudflare Pages
- The `_redirects` file ensures proper routing for your single-page application
- All static files (HTML, CSS, JS, images) will be served from Cloudflare's global CDN
- The Node.js server (`app.js`) is not needed for Cloudflare Pages deployment

## Troubleshooting

- If you see routing issues, check that the `_redirects` file is in your root directory
- If files aren't loading, ensure all file paths are relative to the root directory
- Check the Cloudflare Pages build logs for any errors

## Performance Benefits

- Global CDN distribution
- Automatic HTTPS
- Edge caching
- DDoS protection
- Free tier includes 100,000 requests per day 